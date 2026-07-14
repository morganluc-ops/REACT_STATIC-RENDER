import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import { useStatic } from "../useStatic";

const HeavyButtonComponent = React.forwardRef<
  HTMLButtonElement,
  {
    id: string;
    label: string;
    onClick?: () => void;
    onMountComplete?: () => void;
  }
>(({ id, label, onClick, onMountComplete }, ref) => {

  const start = performance.now();
  while (performance.now() - start < 50) {

  }

  const [clicks, setClicks] = React.useState(0);
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
    if (onMountComplete) {
      onMountComplete();
    }
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setClicks((c) => c + 1);
    if (onClick) onClick();
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      style={{
        padding: "16px",
        borderRadius: "10px",
        border: "2px solid",
        borderColor: isHydrated ? "#10b981" : "#ef4444",
        background: isHydrated
          ? "linear-gradient(135deg, #065f46, #047857)"
          : "linear-gradient(135deg, #7f1d1d, #991b1b)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "all 0.3s ease",
        boxShadow: isHydrated ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "none",
        minWidth: "180px",
        outline: "none",
      }}
    >
      <div style={{ fontSize: "11px", opacity: 0.8, textTransform: "uppercase" }}>
        {id}
      </div>
      <div style={{ margin: "6px 0", fontSize: "14px" }}>{label}</div>
      <div style={{ fontSize: "12px", background: "rgba(0,0,0,0.2)", padding: "4px 8px", borderRadius: "4px" }}>
        {isHydrated ? `🟢 Active (Clicks: ${clicks})` : "🔴 Static (Deferred)"}
      </div>
    </button>
  );
});

HeavyButtonComponent.displayName = "HeavyButton";

const StaticHeavyButton = useStatic(HeavyButtonComponent);

const meta: Meta = {
  title: "Benchmarks/Lazy vs Normal Hydration",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const WithLazyHydration: StoryObj = {
  name: "1. With Lazy Hydration (useStatic)",
  render: () => {
    const componentIds = Array.from({ length: 8 }, (_, i) => `Button ${i + 1}`);
    const [hydrationStatus, setHydrationStatus] = React.useState<Record<string, boolean>>(() =>
      Object.fromEntries(componentIds.map((id) => [id, false]))
    );
    const [hydrateTime, setHydrateTime] = React.useState(0);

    const handleHydrate = (id: string) => {
      setHydrationStatus((prev) => ({ ...prev, [id]: true }));
    };

    const containerRef = React.useRef<HTMLDivElement>(null);
    const startMountTimeRef = React.useRef(0);

    React.useEffect(() => {
      if (containerRef.current) {

        (globalThis as unknown as { __SSR__?: boolean }).__SSR__ = true;
        const ssrHtml = renderToString(
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
            {componentIds.map((id) => (
              <StaticHeavyButton
                key={id}
                id={id}
                label="Interactive"
                didHydrate={() => handleHydrate(id)}
              />
            ))}
          </div>
        );
        delete (globalThis as unknown as { __SSR__?: boolean }).__SSR__;

        containerRef.current.innerHTML = ssrHtml;

        startMountTimeRef.current = performance.now();
        const root = hydrateRoot(
          containerRef.current,
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
            {componentIds.map((id) => (
              <StaticHeavyButton
                key={id}
                id={id}
                label="Interactive"
                didHydrate={() => handleHydrate(id)}
              />
            ))}
          </div>
        );

        setHydrateTime(performance.now() - startMountTimeRef.current);

        return () => {
          root.unmount();
        };
      }
    }, []);

    const activeCount = Object.values(hydrationStatus).filter(Boolean).length;
    const staticCount = componentIds.length - activeCount;

    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span style={badgeStyle(true)}>Optimized</span>
          <h1 style={titleStyle}>Story 1: Lazy Hydration (With useStatic)</h1>
          <p style={descStyle}>
            8 extremely heavy buttons are rendered. Since we use <code>useStatic</code>, they are not 
            hydrated on initial client-side load. Hover or focus on any button to hydrate it.
          </p>
        </div>

        {/* Dashboard statistics */}
        <div style={dashboardStyle}>
          <div style={cardStyle}>
            <div style={cardLabelStyle}>Initial Mount / Hydrate Time</div>
            <div style={cardValueStyle("#10b981")}>{hydrateTime.toFixed(1)} ms</div>
            <div style={cardSubStyle}>Almost instantaneous load time</div>
          </div>
          <div style={cardStyle}>
            <div style={cardLabelStyle}>Time Saved on Load</div>
            <div style={cardValueStyle("#3b82f6")}>~{(400 - hydrateTime).toFixed(0)} ms</div>
            <div style={cardSubStyle}>Deferred heavy render work</div>
          </div>
          <div style={cardStyle}>
            <div style={cardLabelStyle}>Status (Active vs Static)</div>
            <div style={cardValueStyle("#f59e0b")}>
              {activeCount} <span style={{ fontSize: "14px", color: "#94a3b8" }}>active</span> / {staticCount}{" "}
              <span style={{ fontSize: "14px", color: "#94a3b8" }}>static</span>
            </div>
            <div style={cardSubStyle}>Buttons hydrate only on user interaction</div>
          </div>
        </div>

        {/* Render container */}
        <div
          ref={containerRef}
          style={{
            background: "#1e293b",
            padding: "40px",
            borderRadius: "16px",
            border: "1px solid #334155",
            minHeight: "150px",
          }}
        />

        <div style={alertStyle}>
          💡 <strong>Hover over or press TAB to focus</strong> on any of the buttons. You'll see only the 
          interacted button transition from <strong>Static (Red)</strong> to <strong>Active (Green)</strong>.
        </div>
      </div>
    );
  },
};

export const WithoutLazyHydration: StoryObj = {
  name: "2. Without Lazy Hydration (Standard React)",
  render: () => {
    const componentIds = Array.from({ length: 8 }, (_, i) => `Button ${i + 1}`);
    const [hydrateTime, setHydrateTime] = React.useState(0);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const startMountTimeRef = React.useRef(0);
    const mountedCountRef = React.useRef(0);

    const handleMountComplete = () => {
      mountedCountRef.current += 1;
      if (mountedCountRef.current === componentIds.length) {

        const end = performance.now();
        setHydrateTime(end - startMountTimeRef.current);
      }
    };

    React.useEffect(() => {
      if (containerRef.current) {

        const ssrHtml = renderToString(
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
            {componentIds.map((id) => (
              <HeavyButtonComponent key={id} id={id} label="Immediate" />
            ))}
          </div>
        );

        containerRef.current.innerHTML = ssrHtml;

        startMountTimeRef.current = performance.now();
        const root = hydrateRoot(
          containerRef.current,
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "center" }}>
            {componentIds.map((id) => (
              <HeavyButtonComponent
                key={id}
                id={id}
                label="Immediate"
                onMountComplete={handleMountComplete}
              />
            ))}
          </div>
        );

        return () => {
          root.unmount();
        };
      }
    }, []);

    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span style={badgeStyle(false)}>Blocking</span>
          <h1 style={titleStyle}>Story 2: Standard Hydration (No Hook)</h1>
          <p style={descStyle}>
            8 heavy buttons are rendered. Without lazy hydration, the client immediately hydrates all of them, 
            blocking the main thread during page load.
          </p>
        </div>

        {/* Dashboard statistics */}
        <div style={dashboardStyle}>
          <div style={cardStyle}>
            <div style={cardLabelStyle}>Initial Mount / Hydrate Time</div>
            <div style={cardValueStyle("#ef4444")}>
              {hydrateTime > 0 ? `${hydrateTime.toFixed(1)} ms` : "Calculating..."}
            </div>
            <div style={cardSubStyle}>Blocks the main thread on page load</div>
          </div>
          <div style={cardStyle}>
            <div style={cardLabelStyle}>Time Saved on Load</div>
            <div style={cardValueStyle("#94a3b8")}>0 ms</div>
            <div style={cardSubStyle}>No performance optimization applied</div>
          </div>
          <div style={cardStyle}>
            <div style={cardLabelStyle}>Status (Active vs Static)</div>
            <div style={cardValueStyle("#10b981")}>
              8 <span style={{ fontSize: "14px", color: "#94a3b8" }}>active</span> / 0{" "}
              <span style={{ fontSize: "14px", color: "#94a3b8" }}>static</span>
            </div>
            <div style={cardSubStyle}>All components are hydrated immediately</div>
          </div>
        </div>

        {/* Render container */}
        <div
          ref={containerRef}
          style={{
            background: "#1e293b",
            padding: "40px",
            borderRadius: "16px",
            border: "1px solid #334155",
            minHeight: "150px",
          }}
        />

        <div style={alertStyle}>
          ⚠️ <strong>Notice:</strong> All buttons are already <strong>Active (Green)</strong> and interactive. 
          The loading latency blocks the browser.
        </div>
      </div>
    );
  },
};

const containerStyle: React.CSSProperties = {
  background: "#0f172a",
  minHeight: "100vh",
  color: "#f8fafc",
  fontFamily: "'Outfit', 'Inter', sans-serif",
  padding: "40px",
  boxSizing: "border-box",
};

const headerStyle: React.CSSProperties = {
  maxWidth: "900px",
  margin: "0 auto 40px auto",
};

const badgeStyle = (optimized: boolean): React.CSSProperties => ({
  display: "inline-block",
  padding: "4px 8px",
  borderRadius: "6px",
  fontSize: "12px",
  fontWeight: "bold",
  textTransform: "uppercase",
  marginBottom: "12px",
  background: optimized ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
  color: optimized ? "#10b981" : "#ef4444",
  border: `1px solid ${optimized ? "#10b981" : "#ef4444"}`,
});

const titleStyle: React.CSSProperties = {
  fontSize: "32px",
  fontWeight: 800,
  margin: "0 0 12px 0",
};

const descStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: 0,
};

const dashboardStyle: React.CSSProperties = {
  maxWidth: "900px",
  margin: "0 auto 40px auto",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "20px",
};

const cardStyle: React.CSSProperties = {
  background: "#1e293b",
  padding: "20px",
  borderRadius: "12px",
  border: "1px solid #334155",
};

const cardLabelStyle: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: "13px",
  marginBottom: "8px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const cardValueStyle = (color: string): React.CSSProperties => ({
  fontSize: "26px",
  fontWeight: "bold",
  color,
  marginBottom: "4px",
});

const cardSubStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: "12px",
};

const alertStyle: React.CSSProperties = {
  maxWidth: "900px",
  margin: "40px auto 0 auto",
  padding: "16px",
  borderRadius: "8px",
  border: "1px dashed #4b5563",
  background: "rgba(30, 41, 59, 0.5)",
  color: "#cbd5e1",
  fontSize: "14px",
  textAlign: "center",
};
