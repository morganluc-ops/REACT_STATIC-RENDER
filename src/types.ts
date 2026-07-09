import type * as React from "react";

/**
 * Options for customizing the lazy hydration behavior.
 */
export interface LazyHydrationOptions {
  /**
   * If true, the component will remain static and will never be hydrated.
   * Useful for completely static components that don't need interactivity.
   * @default false
   */
  ssrOnly?: boolean;

  /**
   * List of DOM events on the wrapper element that will trigger hydration.
   * e.g., 'pointerover', 'focusin', 'keydown' etc.
   * @default ['pointerover', 'focusin', 'keydown']
   */
  on?: (keyof HTMLElementEventMap)[] | keyof HTMLElementEventMap;

  /**
   * By default, a wrapper `div` element with `display: contents` style is rendered
   * to capture event listeners and reference the DOM node.
   * If noWrapper is set to true (or a custom element tag string), it behaves as follows:
   * - Before hydration, it MUST render the wrapper element to match the server HTML structure.
   * - After hydration, it can replace it with direct children if `noWrapper` is true.
   * @default false
   */
  noWrapper?: boolean | keyof JSX.IntrinsicElements;

  /**
   * Callback function triggered immediately after hydration completes on the client.
   */
  didHydrate?: () => void;

  /**
   * Extra props to pass to the wrapper element (e.g. className, style).
   */
  wrapperProps?: Omit<React.HTMLProps<HTMLElement>, "dangerouslySetInnerHTML" | "ref">;
}

/**
 * Signature for the HOC wrapper component returned by useStatic.
 */
export type StaticComponentWrapper<P> = React.ComponentType<P & LazyHydrationOptions>;
