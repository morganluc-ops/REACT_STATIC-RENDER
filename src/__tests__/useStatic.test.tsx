import * as React from "react";
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { act, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { useStatic, LazyHydrate, SafeStaticHTML } from "../useStatic";

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
    await act(async () => {
      button?.click();
    });
    expect(handleClick).not.toHaveBeenCalled();

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
    });

    const hydratedButton = container.querySelector("button");
    expect(hydratedButton?.textContent).toBe("Click Me (Active)");

    await act(async () => {
      hydratedButton?.click();
    });
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
    await act(async () => {
      button?.click();
    });
    expect(handleClick).not.toHaveBeenCalled();
  });

  test("should support custom wrapper element string tag", async () => {
    const StaticButton = useStatic(TestButton);
    const html = ssrRender(
      <StaticButton noWrapper="span">Span Wrapper</StaticButton>
    );

    expect(html).toContain("<span");
    expect(html).not.toContain("<div");
  });

  test("should preserve wrapper with display: contents style when noWrapper is true both pre and post hydration", async () => {
    const StaticButton = useStatic(TestButton);
    const html = ssrRender(
      <StaticButton noWrapper>No Wrapper Test</StaticButton>
    );
    container.innerHTML = html;

    expect(html).toContain('style="display:contents"');

    await act(async () => {
      hydrateRoot(
        container,
        <StaticButton noWrapper>No Wrapper Test</StaticButton>
      );
    });

    const wrapper = container.querySelector("div");
    expect(wrapper).not.toBeNull();
    expect(wrapper?.style.display).toBe("contents");

    // Trigger hydration
    await act(async () => {
      wrapper?.dispatchEvent(new MouseEvent("pointerover", { bubbles: true }));
    });

    // Verify DOM structure continuity post hydration
    const wrapperPostHydration = container.querySelector("div");
    expect(wrapperPostHydration).not.toBeNull();
    expect(wrapperPostHydration?.style.display).toBe("contents");
    expect(wrapperPostHydration?.querySelector("button")?.textContent).toBe("No Wrapper Test (Active)");
  });

  test("should trigger hydration when 'visible' trigger is used with IntersectionObserver", async () => {
    let observerCallback: IntersectionObserverCallback | null = null;
    const observeMock = vi.fn();
    const disconnectMock = vi.fn();

    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin: string = "";
      readonly thresholds: ReadonlyArray<number> = [];
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
      observe = observeMock;
      unobserve = vi.fn();
      disconnect = disconnectMock;
      takeRecords = vi.fn(() => []);
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const StaticButton = useStatic(TestButton);
    const html = ssrRender(
      <StaticButton on="visible">Visible Hydration Button</StaticButton>
    );
    container.innerHTML = html;

    await act(async () => {
      hydrateRoot(
        container,
        <StaticButton on="visible">Visible Hydration Button</StaticButton>
      );
    });

    const button = container.querySelector("button");
    expect(button?.textContent).toBe("Visible Hydration Button (Static)");
    expect(observeMock).toHaveBeenCalledTimes(1);

    // Simulate element scrolling into view
    await act(async () => {
      if (observerCallback) {
        observerCallback(
          [{ isIntersecting: true } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      }
    });

    const hydratedButton = container.querySelector("button");
    expect(hydratedButton?.textContent).toBe("Visible Hydration Button (Active)");
    expect(disconnectMock).toHaveBeenCalled();
  });

  test("should forward observerOptions to IntersectionObserver and observe the wrapper element", async () => {
    let capturedOptions: IntersectionObserverInit | undefined;
    const observeMock = vi.fn();

    class MockIntersectionObserver implements IntersectionObserver {
      readonly root: Element | Document | null = null;
      readonly rootMargin: string = "";
      readonly thresholds: ReadonlyArray<number> = [];
      constructor(_callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        capturedOptions = options;
      }
      observe = observeMock;
      unobserve = vi.fn();
      disconnect = vi.fn();
      takeRecords = vi.fn(() => []);
    }

    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);

    const StaticButton = useStatic(TestButton);
    const observerOptions: IntersectionObserverInit = { rootMargin: "20px", threshold: 0.5 };
    const html = ssrRender(
      <StaticButton on="visible" observerOptions={observerOptions}>
        Options Button
      </StaticButton>
    );
    container.innerHTML = html;

    await act(async () => {
      hydrateRoot(
        container,
        <StaticButton on="visible" observerOptions={observerOptions}>
          Options Button
        </StaticButton>
      );
    });

    expect(capturedOptions).toEqual(observerOptions);
    expect(observeMock).toHaveBeenCalledTimes(1);
    expect(observeMock.mock.calls[0][0].tagName.toLowerCase()).toBe("div");
  });

  test("should not crash when 'visible' trigger is used in environments without IntersectionObserver", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);

    const StaticButton = useStatic(TestButton);
    const html = ssrRender(
      <StaticButton on="visible">No Observer Button</StaticButton>
    );
    container.innerHTML = html;

    await act(async () => {
      hydrateRoot(
        container,
        <StaticButton on="visible">No Observer Button</StaticButton>
      );
    });

    const button = container.querySelector("button");
    expect(button?.textContent).toBe("No Observer Button (Static)");
  });

  test("should not allow wrapperProps to override dangerouslySetInnerHTML in SafeStaticHTML", () => {
    const ref = React.createRef<HTMLElement>();
    const wrapperProps = {
      dangerouslySetInnerHTML: { __html: "<script>alert('xss')</script>" },
    };

    const element = (SafeStaticHTML.type as React.FC<any>)({
      wrapper: "div",
      childRef: ref,
      wrapperProps,
    }) as React.ReactElement;

    expect(element.props.dangerouslySetInnerHTML).toEqual({ __html: "" });
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
