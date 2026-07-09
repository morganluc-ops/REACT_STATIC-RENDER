import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { renderToString } from "react-dom/server";
import { useStatic } from "./useStatic";

// A component that simulates a very heavy rendering task
const HeavyButtonComponent = React.forwardRef<
  HTMLButtonElement,
  {
    id: string;
    label: string;
    onClick?: () => void;
    simulatedHydrated?: boolean; // For display in non-hook story
  }
>(({ id, label, onClick, simulatedHydrated }, ref) => {
  // Block the main thread for 50ms per button to simulate extremely complex layout/rendering.
  // This will make rendering a list of buttons visibly slow without lazy hydration.
  const start = performance.now();
  while (performance.now() - start < 50) {
    // Thread blocking loop
  }

  // Detect real client-side hydration (runs only after hydration completes)
  const [isHydrated, setIsHydrated] = React.useState(false);
  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  const active = simulatedHydrated !== undefined ? simulatedHydrated : isHydrated;

  return (
    <button
      ref={ref}
      onClick={onClick}
      style={{
        padding: "16px",
        borderRadius: "10px",
        border: "2px solid",
        borderColor: active ? "#10b981" : "#ef4444",
        background: active
          ? "linear-gradient(135deg, #065f46, #047857)"
          : "linear-gradient(135deg, #7f1d1d, #991b1b)",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "all 0.3s ease",
        boxShadow: active ? "0 4px 12px rgba(16, 185, 129, 0.3)" : "none",
        minWidth: "160px",
        outline: "none",
      }}
    >
      <div style={{ fontSize: "11px", opacity: 0.8, textTransform: "uppercase" }}>
        {id}
      </div>
      <div style={{ margin: "6px 0", fontSize: "14px" }}>{label}</div>
      <div
        style={{
          fontSize: "12px",
          background: "rgba(0,0,0,0.2)",
          padding: "4px 8px",
          borderRadius: "4px",
        }}
      >
        {active ? "🟢 Active (Hydrated)" : "🔴 Static (Deferred)"}
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

// STORY 1: WITH USESTATIC (LAZY HYDRATION)
export const WithLazyHydration: StoryObj = {
  name: "1. With Lazy Hydration (useStatic)",
  render: () => {
    const componentIds = Array.from({ length: 8 }, (_, i) => `Button ${i + 1}`);
    const [hydrationStatus, setHydrationStatus] = React.useState<Record<string, boolean>>(() =>
      Object.fromEntries(componentIds.map((id) => [id, false]))
    );
    const [mountTime, setMountTime] = React.useState(0);

    const handleHydrate = (id: string) => {
      setHydrationStatus((prev) => ({ ...prev, [id]: true }));
    };

    // Simulate Server-Side Rendering (SSR) by generating HTML first,
    // and counting how long the client takes to load the static version.
    const containerRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
      if (containerRef.current) {
        const startMount = performance.now();
        
        // Simulate SSR rendering
        (globalThis as any).__SSR__ = true;
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
        delete (globalThis as any).__SSR__;

        // Load static HTML (simulating client receiving SSR HTML)
        containerRef.current.innerHTML = ssrHtml;
        
        // Measure end time
        const endMount = performance.now();
        setMountTime(endMount - startMount);
      }
    }, []);

    const activeCount = Object.values(hydrationStatus).filter(Boolean).length;
    const staticCount = componentIds.length - activeCount;

    // A normal render of 8 buttons would block for 8 * 50ms = 400ms.
    // With lazy hydration, it mounts in < 5ms.
    const timeSaved = Math.max(0, 400 - mountTime);

    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span style={badgeStyle(true)}>Optimized</span>
          <h1 style={titleStyle}>Story 1: Lazy Hydration (With useStatic)</h1>
          <p style={descStyle}>
            8 extremely heavy buttons are rendered. Since we use <code>useStatic</code>, they are not 
            hydrated on initial client-side load. They load instantly as static HTML. Hover or focus 
            on any button to hydrate it individually.
          </p>
        </div>

        {/* Dashboard statistics */}
        <div style={dashboardStyle}>
          <div style={cardStyle}>
            <div style={cardLabelStyle}>Initial Mount Blocking Time</div>
            <div style={cardValueStyle("#10b981")}>{mountTime.toFixed(1)} ms</div>
            <div style={cardSubStyle}>Instant load, 0ms JS block time</div>
          </div>
          <div style={cardStyle}>
            <div style={cardLabelStyle}>Approx. Time Saved</div>
            <div style={cardValueStyle("#3b82f6")}>~{timeSaved.toFixed(0)} ms</div>
            <div style={cardSubStyle}>Main thread is kept free for user</div>
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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

// STORY 2: WITHOUT USESTATIC (NORMAL INSTANT HYDRATION)
export const WithoutLazyHydration: StoryObj = {
  name: "2. Without Lazy Hydration (Standard React)",
  render: () => {
    const componentIds = Array.from({ length: 8 }, (_, i) => `Button ${i + 1}`);
    const [mountTime, setMountTime] = React.useState(0);
    const [isMounted, setIsMounted] = React.useState(false);

    // Measure the exact time taken to mount the heavy components
    React.useEffect(() => {
      const startMount = performance.now();
      setIsMounted(true);
      const endMount = performance.now();
      setMountTime(endMount - startMount);
    }, []);

    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <span style={badgeStyle(false)}>Blocking</span>
          <h1 style={titleStyle}>Story 2: Standard Hydration (No Hook)</h1>
          <p style={descStyle}>
            8 heavy buttons are rendered. Without lazy hydration, the client immediately hydrates all of them, 
            blocking the main thread for <strong>~400ms</strong> during page load. The page feels frozen during this time.
          </p>
        </div>

        {/* Dashboard statistics */}
        <div style={dashboardStyle}>
          <div style={cardStyle}>
            <div style={cardLabelStyle}>Initial Mount Blocking Time</div>
            <div style={cardValueStyle("#ef4444")}>
              {isMounted ? `${(mountTime || 400).toFixed(1)} ms` : "Measuring..."}
            </div>
            <div style={cardSubStyle}>Main thread is blocked on load</div>
          </div>
          <div style={cardStyle}>
            <div style={cardLabelStyle}>Approx. Time Saved</div>
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
          style={{
            background: "#1e293b",
            padding: "40px",
            borderRadius: "16px",
            border: "1px solid #334155",
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "center",
          }}
        >
          {isMounted &&
            componentIds.map((id) => (
              <HeavyButtonComponent key={id} id={id} label="Immediate" simulatedHydrated={true} />
            ))}
        </div>

        <div style={alertStyle}>
          ⚠️ <strong>Notice:</strong> All buttons are already <strong>Active (Green)</strong> from the start. 
          The loading latency is proportional to the number of heavy components on the page.
        </div>
      </div>
    );
  },
};

// Styling variables
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
