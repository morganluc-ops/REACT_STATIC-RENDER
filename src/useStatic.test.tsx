import * as React from "react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act } from "@testing-library/react";
import { useStatic } from "./useStatic";

// A simple interactive counter button to test hydration and effect lifecycle
const TestButton = React.forwardRef<
  HTMLButtonElement,
  { onClick?: () => void; children: React.ReactNode }
>(({ onClick, children }, ref) => {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button ref={ref} onClick={onClick} data-mounted={mounted}>
      {children}
      {mounted ? " (Active)" : " (Static)"}
    </button>
  );
});

TestButton.displayName = "TestButton";

// Helper to simulate server environment during renderToString in jsdom tests
function ssrRender(element: React.ReactElement): string {
  (global as any).__SSR__ = true;
  try {
    return renderToString(element);
  } finally {
    delete (global as any).__SSR__;
  }
}

describe("useStatic lazy hydration hook", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  test("should render child component completely during Server-Side Rendering (SSR)", () => {
    const StaticButton = useStatic(TestButton);
    const html = ssrRender(
      <StaticButton onClick={() => {}}>Click Me</StaticButton>
    );

    // Verify SSR output contains the button and the initial state text
    expect(html).toContain("Click Me");
    expect(html).toContain(" (Static)");
    // The wrapper should have display: contents by default
    expect(html).toContain('style="display:contents"');
  });

  test("should defer client-side hydration until interaction occurs", async () => {
    const handleClick = vi.fn();
    const StaticButton = useStatic(TestButton);

    // 1. Generate SSR HTML
    const html = ssrRender(
      <StaticButton onClick={handleClick}>Click Me</StaticButton>
    );
    container.innerHTML = html;

    // Verify initial state in DOM
    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    expect(button?.textContent).toBe("Click Me (Static)");

    // 2. Perform client-side hydration
    await act(async () => {
      hydrateRoot(
        container,
        <StaticButton onClick={handleClick}>Click Me</StaticButton>
      );
    });

    // Verify that child component is still NOT hydrated (useEffect not run, onClick not active)
    expect(button?.textContent).toBe("Click Me (Static)");
    button?.click();
    expect(handleClick).not.toHaveBeenCalled();

    // 3. Trigger hover (pointerover) to force hydration
    await act(async () => {
      button?.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
    });

    // Re-query the button from the container as React replaces the static DOM nodes
    const hydratedButton = container.querySelector("button");
    expect(hydratedButton?.textContent).toBe("Click Me (Active)");

    // Verify that clicks now work normally
    hydratedButton?.click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("should trigger hydration on focus", async () => {
    const StaticButton = useStatic(TestButton);
    const html = ssrRender(
      <StaticButton onClick={() => {}}>Focus Me</StaticButton>
    );
    container.innerHTML = html;

    const button = container.querySelector("button");

    await act(async () => {
      hydrateRoot(
        container,
        <StaticButton onClick={() => {}}>Focus Me</StaticButton>
      );
    });

    expect(button?.textContent).toBe("Focus Me (Static)");

    // Trigger focusin event
    await act(async () => {
      button?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });

    // Re-query the button from the container after hydration
    const hydratedButton = container.querySelector("button");
    expect(hydratedButton?.textContent).toBe("Focus Me (Active)");
  });

  test("should trigger hydration on keydown", async () => {
    const StaticButton = useStatic(TestButton);
    const html = ssrRender(
      <StaticButton onClick={() => {}}>Press Me</StaticButton>
    );
    container.innerHTML = html;

    const button = container.querySelector("button");

    await act(async () => {
      hydrateRoot(
        container,
        <StaticButton onClick={() => {}}>Press Me</StaticButton>
      );
    });

    expect(button?.textContent).toBe("Press Me (Static)");

    // Trigger keydown event
    await act(async () => {
      button?.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })
      );
    });

    // Re-query the button from the container after hydration
    const hydratedButton = container.querySelector("button");
    expect(hydratedButton?.textContent).toBe("Press Me (Active)");
  });

  test("should support ssrOnly option and never hydrate", async () => {
    const handleClick = vi.fn();
    const StaticButton = useStatic(TestButton);

    const html = ssrRender(
      <StaticButton ssrOnly onClick={handleClick}>
        Static Only
      </StaticButton>
    );
    container.innerHTML = html;

    const button = container.querySelector("button");

    await act(async () => {
      hydrateRoot(
        container,
        <StaticButton ssrOnly onClick={handleClick}>
          Static Only
        </StaticButton>
      );
    });

    expect(button?.textContent).toBe("Static Only (Static)");

    // Attempt interactions
    await act(async () => {
      button?.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
      button?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      button?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }));
    });

    // Content should remain static and clicks should not work
    expect(button?.textContent).toBe("Static Only (Static)");
    button?.click();
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("should support custom wrapper element", async () => {
    const StaticButton = useStatic(TestButton);
    const html = ssrRender(
      <StaticButton noWrapper="span">Span Wrapper</StaticButton>
    );

    // Verify it renders a span tag instead of a div
    expect(html).toContain("<span");
    expect(html).not.toContain("<div");
  });
});
