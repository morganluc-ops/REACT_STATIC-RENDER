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
   * List of DOM events or special triggers (e.g., 'visible') on the wrapper element that will trigger hydration.
   * Use 'visible' to hydrate when the element enters the viewport via IntersectionObserver.
   * e.g., 'pointerover', 'pointerdown', 'focusin', 'keydown', 'click', 'visible'
   * @default ['pointerover', 'pointerdown', 'focusin', 'keydown', 'click']
   */
  on?:
    | (keyof HTMLElementEventMap | "visible")[]
    | keyof HTMLElementEventMap
    | "visible";

  /**
   * Options passed to IntersectionObserver when 'visible' is used in `on`.
   */
  observerOptions?: IntersectionObserverInit;

  /**
   * Configures the HTML tag wrapper behavior.
   * - `false`: Uses a default `div` wrapper element.
   * - `true`: Uses a `div` wrapper with `display: contents` styling to avoid visual layout shifts while preserving DOM hierarchy before and after hydration.
   * - `string`: Specifies a custom HTML tag (e.g., `'span'`, `'article'`).
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
