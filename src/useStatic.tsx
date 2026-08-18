import * as React from "react";
import type { LazyHydrationOptions } from "./types";

const EMPTY_HTML = { __html: "" };

interface SafeStaticHTMLProps {
  wrapper: React.ElementType;
  childRef: React.RefObject<HTMLElement>;
  wrapperProps?: React.HTMLProps<HTMLElement>;
}

export const SafeStaticHTML = React.memo(
  ({ wrapper: Wrapper, childRef, wrapperProps }: SafeStaticHTMLProps) => {
    return (
      <Wrapper
        {...wrapperProps}
        ref={childRef}
        suppressHydrationWarning
        dangerouslySetInnerHTML={EMPTY_HTML}
      />
    );
  },
  () => true
);

/**
 * LazyHydrate is a wrapper component that defers the hydration of its children
 * until a specific interaction (hover, focus, keyboard) occurs.
 */
export function LazyHydrate({
  children,
  ssrOnly = false,
  on = ["pointerover", "pointerdown", "focusin", "keydown", "click"],
  noWrapper = false,
  didHydrate,
  wrapperProps,
  observerOptions,
}: LazyHydrationOptions & { children: React.ReactNode }) {
  const childRef = React.useRef<HTMLElement>(null);

  // Evaluate isServer dynamically during render to support testing environments
  const isServer =
    typeof window === "undefined" ||
    (typeof globalThis !== "undefined" && Boolean((globalThis as any).__SSR__));

  // Initialize hydration state:
  const [hydrated, setHydrated] = React.useState(isServer);

  // Safely use layout effect on client, normal effect on server (prevents SSR warnings)
  const useIsomorphicEffect = isServer ? React.useEffect : React.useLayoutEffect;

  // If the wrapper has no children on client-side mount, it means the server
  // did not render any HTML or it was empty. In this case, hydrate immediately.
  useIsomorphicEffect(() => {
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

    // Normalize event(s)/trigger(s) to array
    const triggers = Array.isArray(on) ? on : [on];

    triggers.forEach((trigger) => {
      if (trigger === "visible") {
        if (typeof IntersectionObserver !== "undefined") {
          const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                triggerHydration();
              }
            });
          }, observerOptions);

          observer.observe(rootElement);
          cleanupFns.push(() => {
            observer.disconnect();
          });
        }
      } else {
        rootElement.addEventListener(trigger, triggerHydration, {
          once: true,
          passive: true,
        });
        cleanupFns.push(() => {
          rootElement.removeEventListener(trigger, triggerHydration);
        });
      }
    });

    return () => {
      cleanupFns.forEach((cleanup) => cleanup());
    };
  }, [hydrated, on, ssrOnly, observerOptions]);

  // Determine wrapper tag (defaults to "div")
  const WrapperElement = (typeof noWrapper === "string"
    ? noWrapper
    : "div") as React.ElementType;

  // Combine wrapperProps with display: contents when noWrapper is true
  const computedWrapperProps = React.useMemo(() => {
    if (noWrapper === true) {
      return {
        ...wrapperProps,
        style: {
          display: "contents",
          ...wrapperProps?.style,
        },
      };
    }
    return wrapperProps;
  }, [noWrapper, wrapperProps]);

  if (hydrated) {
    return (
      <WrapperElement
        ref={childRef}
        {...computedWrapperProps}
      >
        {children}
      </WrapperElement>
    );
  }

  // Pre-hydration state:
  // Render a memoized static wrapper that never updates to prevent React from
  // reconciling (and thus clearing) the server-generated HTML inside it.
  return (
    <SafeStaticHTML
      wrapper={WrapperElement}
      childRef={childRef}
      wrapperProps={computedWrapperProps}
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
  const WrappedComponent = React.forwardRef<HTMLElement, P & LazyHydrationOptions>(
    (props, ref) => {
      const {
        ssrOnly = defaultOptions.ssrOnly,
        on = defaultOptions.on,
        noWrapper = defaultOptions.noWrapper,
        didHydrate = defaultOptions.didHydrate,
        wrapperProps = defaultOptions.wrapperProps,
        observerOptions = defaultOptions.observerOptions,
        ...restProps
      } = props;

      return (
        <LazyHydrate
          ssrOnly={ssrOnly}
          on={on}
          noWrapper={noWrapper}
          didHydrate={didHydrate}
          wrapperProps={wrapperProps}
          observerOptions={observerOptions}
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
