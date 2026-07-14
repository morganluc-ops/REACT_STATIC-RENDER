import * as React from "react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act } from "@testing-library/react";
import { axe } from "jest-axe";
import { useStatic } from "../useStatic";

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

function ssrRender(element: React.ReactElement): string {
  (globalThis as unknown as { __SSR__?: boolean }).__SSR__ = true;
  try {
    return renderToString(element);
  } finally {
    delete (globalThis as unknown as { __SSR__?: boolean }).__SSR__;
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

    expect(html).toContain("Click Me");
    expect(html).toContain(" (Static)");
  });

  test("should defer client-side hydration until interaction occurs", async () => {
    const handleClick = vi.fn();
    const StaticButton = useStatic(TestButton);

    const html = ssrRender(
      <StaticButton onClick={handleClick}>Click Me</StaticButton>
    );
    container.innerHTML = html;

    const button = container.querySelector("button");
    expect(button).not.toBeNull();
    expect(button?.textContent).toBe("Click Me (Static)");

    await act(async () => {
      hydrateRoot(
        container,
        <StaticButton onClick={handleClick}>Click Me</StaticButton>
      );
    });

    expect(button?.textContent).toBe("Click Me (Static)");
    button?.click();
    expect(handleClick).not.toHaveBeenCalled();

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
    });

    const hydratedButton = container.querySelector("button");
    expect(hydratedButton?.textContent).toBe("Click Me (Active)");

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

    await act(async () => {
      button?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    });

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

    await act(async () => {
      button?.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })
      );
    });

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

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
      button?.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      button?.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true }));
    });

    expect(button?.textContent).toBe("Static Only (Static)");
    button?.click();
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("should support custom wrapper element", async () => {
    const StaticButton = useStatic(TestButton);
    const html = ssrRender(
      <StaticButton noWrapper="span">Span Wrapper</StaticButton>
    );

    expect(html).toContain("<span");
    expect(html).not.toContain("<div");
  });

  test("should not have any accessibility violations", async () => {
    const StaticButton = useStatic(TestButton);
    const html = ssrRender(
      <StaticButton onClick={() => {}}>Accessible Button</StaticButton>
    );
    container.innerHTML = html;

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
