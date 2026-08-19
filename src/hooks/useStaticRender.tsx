import React, {
  ReactElement,
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";
import { renderToStaticMarkup } from "react-dom/server";

const SLOT_MARKER = "___SLOT_MARKER___";

export interface StaticRenderOptions {
  /**
   * The delay (in milliseconds) before hydration (replacement with the interactive component) on hover.
   * @default 30
   */
  hydrationDelay?: number;
}

export interface StaticItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The text content to be inserted into the static element.
   * Only supports strings to ensure fast HTML insertion.
   */
  children: string;
}

/**
 * Generates an ultra-lightweight static version of a React component, with asynchronous hydration on hover.
 *
 * This hook takes a base element and converts it into an HTML string (`prototypeMarkup`).
 * It returns a `StaticItem` component that directly displays this HTML for high performance.
 * On hover (`onMouseEnter`), the element is hydrated with the actual interactive React component.
 *
 * @param baseElement The base React element to render statically (e.g., `<Button variant="contained" />`).
 * @param options Configuration options for static rendering.
 * @returns An object containing the `StaticItem` component to be used in lists.
 */
export const useStaticRender = <P extends object>(
  baseElement: ReactElement<P>,
  options: StaticRenderOptions = {},
) => {
  const { hydrationDelay = 30 } = options;

  const prototypeMarkup = useMemo(() => {
    const props = baseElement.props as P & { children?: React.ReactNode };
    const template = React.cloneElement(
      baseElement,
      props,
      props.children || SLOT_MARKER,
    );
    return renderToStaticMarkup(template);
  }, [baseElement]);

  const StaticItem = useMemo(() => {
    const Component = ({ children, ...wrapperProps }: StaticItemProps) => {
      const [isInteractive, setIsInteractive] = useState<boolean>(false);
      const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

      useEffect(() => {
        return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
        };
      }, []);

      const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        timerRef.current = setTimeout(() => {
          setIsInteractive(true);
        }, hydrationDelay);
        wrapperProps.onMouseEnter?.(e);
      };

      const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        setIsInteractive(false);
        wrapperProps.onMouseLeave?.(e as React.MouseEvent<HTMLDivElement>);
      };

      if (isInteractive) {
        return React.cloneElement(
          baseElement,
          {
            onMouseLeave: handleMouseLeave,
            ...baseElement.props,
          },
          children,
        );
      }

      return (
        <div
          {...wrapperProps}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          dangerouslySetInnerHTML={{
            __html: prototypeMarkup.replace(SLOT_MARKER, children),
          }}
        />
      );
    };
    return Component;
  }, [prototypeMarkup, baseElement, hydrationDelay]);

  return { StaticItem };
};
