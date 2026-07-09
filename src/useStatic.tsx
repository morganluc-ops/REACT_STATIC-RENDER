import * as React from "react";
import type { LazyHydrationOptions } from "./types";

// React throws layout effect warnings during Server-Side Rendering (SSR).
// We use useIsomorphicLayoutEffect to safely run layout effect on client and normal effect on server.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/**
 * LazyHydrate is a wrapper component that defers the hydration of its children
 * until a specific interaction (hover, focus, keyboard) occurs.
 *
 * It works by rendering an empty element with `dangerouslySetInnerHTML={{ __html: "" }}`
 * on the client during initial hydration, which forces React to bypass reconciling
 * the server-rendered HTML inside this DOM node. Once an interaction occurs,
 * it switches to rendering the active React children.
 */
export function LazyHydrate({
  children,
  ssrOnly = false,
  on = ["pointerover", "focusin", "keydown"],
  noWrapper = false,
  didHydrate,
  wrapperProps,
}: LazyHydrationOptions & { children: React.ReactNode }) {
  const childRef = React.useRef<HTMLElement>(null);

  // Evaluate isServer dynamically during render to support testing environments
  const isServer =
    typeof window === "undefined" ||
    (typeof globalThis !== "undefined" && (globalThis as any).__SSR__);

  // Initialize hydration state:
  // - On the server: always true so that the children are fully rendered to HTML.
  // - On the client: false initially to delay hydration.
  const [hydrated, setHydrated] = React.useState(isServer);

  // If the wrapper has no children on client-side mount, it means the server
  // did not render any HTML or it was empty. In this case, hydrate immediately.
  useIsomorphicLayoutEffect(() => {
    if (childRef.current && !childRef.current.hasChildNodes()) {
      setHydrated(true);
    }
  }, []);

  // Fire callback exactly once after hydration completes
  const didHydrateRef = React.useRef(false);
  React.useEffect(() => {
    if (hydrated && didHydrate && !didHydrateRef.current) {
      didHydrateRef.current = true;
      didHydrate();
    }
  }, [hydrated, didHydrate]);

  // Set up event listeners to trigger hydration on interaction
  React.useEffect(() => {
    if (ssrOnly || hydrated || !childRef.current) {
      return;
    }

    const rootElement = childRef.current;
    const cleanupFns: (() => void)[] = [];

    const triggerHydration = () => {
      setHydrated(true);
    };

    // Normalize event(s) to array
    const eventTypes = Array.isArray(on) ? on : [on];

    // Attach event listeners. We use bubbling events (pointerover, focusin)
    // because the user interacts with the child elements inside the wrapper.
    eventTypes.forEach((eventType) => {
      rootElement.addEventListener(eventType, triggerHydration, {
        once: true,
        passive: true,
      });
      cleanupFns.push(() => {
        rootElement.removeEventListener(eventType, triggerHydration);
      });
    });

    return () => {
      cleanupFns.forEach((cleanup) => cleanup());
    };
  }, [hydrated, on, ssrOnly]);

  // Determine wrapper tag (defaults to "div")
  const WrapperElement = (typeof noWrapper === "string"
    ? noWrapper
    : "div") as React.ElementType;

  if (hydrated) {
    if (noWrapper === true) {
      return <>{children}</>;
    }
    return (
      <WrapperElement
        ref={childRef}
        style={{ display: "contents" }}
        {...wrapperProps}
      >
        {children}
      </WrapperElement>
    );
  }

  // Pre-hydration state:
  // Render the wrapper element with an empty innerHTML to prevent React from
  // reconciling (and thus hydrating) the server-generated HTML inside it.
  return (
    <WrapperElement
      ref={childRef}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: "" }}
      {...wrapperProps}
    />
  );
}

/**
 * useStatic is a Higher-Order Component (HOC) that wraps a React component
 * to defer its hydration until the user interacts with it (hover, focus, keyboard).
 *
 * @param Component The React component to render statically.
 * @param defaultOptions Default options to configure the lazy hydration behavior.
 * @returns A component that forwards refs and accepts LazyHydrationOptions.
 *
 * @example
 * ```tsx
 * const StaticButton = useStatic(Button);
 * // ...
 * <StaticButton onClick={() => alert('Clicked!')}>Click Me</StaticButton>
 * ```
 */
export function useStatic<P extends object>(
  Component: React.ComponentType<P>,
  defaultOptions: LazyHydrationOptions = {}
): React.ComponentType<P & LazyHydrationOptions> {
  const WrappedComponent = React.forwardRef<any, P & LazyHydrationOptions>(
    (props, ref) => {
      const {
        ssrOnly = defaultOptions.ssrOnly,
        on = defaultOptions.on,
        noWrapper = defaultOptions.noWrapper,
        didHydrate = defaultOptions.didHydrate,
        wrapperProps = defaultOptions.wrapperProps,
        ...restProps
      } = props as any;

      return (
        <LazyHydrate
          ssrOnly={ssrOnly}
          on={on}
          noWrapper={noWrapper}
          didHydrate={didHydrate}
          wrapperProps={wrapperProps}
        >
          <Component ref={ref} {...(restProps as P)} />
        </LazyHydrate>
      );
    }
  );

  WrappedComponent.displayName = `useStatic(${
    Component.displayName || Component.name || "Component"
  })`;

  return WrappedComponent as unknown as React.ComponentType<P & LazyHydrationOptions>;
}
