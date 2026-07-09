import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useStatic } from "./useStatic";

// A dummy component to simulate a heavy or interactive component
const CustomButtonComponent = React.forwardRef<
  HTMLButtonElement,
  {
    label: string;
    onClick?: () => void;
    id: string;
  }
>(({ label, onClick, id }, ref) => {
  const [clicks, setClicks] = React.useState(0);
  const [isHydratedOnClient, setIsHydratedOnClient] = React.useState(false);

  // This effect runs immediately when this component hydrates on the client
  React.useEffect(() => {
    setIsHydratedOnClient(true);
  }, []);

  const handleClick = () => {
    setClicks((c) => c + 1);
    if (onClick) onClick();
  };

  return (
    <button
      ref={ref}
      onClick={handleClick}
      style={{
        padding: "12px 24px",
        borderRadius: "8px",
        border: "1px solid",
        borderColor: isHydratedOnClient ? "#3b82f6" : "#4b5563",
        background: isHydratedOnClient
          ? "linear-gradient(135deg, #1e3a8a, #0d9488)"
          : "#1f2937",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "all 0.3s ease",
        boxShadow: isHydratedOnClient
          ? "0 4px 14px rgba(59, 130, 246, 0.4)"
          : "none",
        fontSize: "14px",
        minWidth: "180px",
        outline: "none",
      }}
    >
      <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "4px" }}>
        {id}
      </div>
      <div>{label}</div>
      <div style={{ marginTop: "8px", fontSize: "12px", opacity: 0.9 }}>
        Clicks: <span style={{ color: "#10b981", fontWeight: "bold" }}>{clicks}</span>
      </div>
    </button>
  );
});

CustomButtonComponent.displayName = "CustomButton";

// Wrap the component using the HOC
const StaticButton = useStatic(CustomButtonComponent);

const meta: Meta = {
  title: "Library/useStatic",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const InteractiveDemo: StoryObj = {
  render: () => {
    const componentIds = ["Button A", "Button B", "Button C", "Button D", "Button E"];
    
    // Track hydration status of each component by ID
    const [hydrationStatus, setHydrationStatus] = React.useState<Record<string, boolean>>(() =>
      Object.fromEntries(componentIds.map((id) => [id, false]))
    );

    const handleHydrated = (id: string) => {
      setHydrationStatus((prev) => ({
        ...prev,
        [id]: true,
      }));
    };

    const hydratedCount = Object.values(hydrationStatus).filter(Boolean).length;
    const staticCount = componentIds.length - hydratedCount;

    return (
      <div
        style={{
          background: "#0f172a",
          minHeight: "100vh",
          color: "#f8fafc",
          fontFamily: "'Outfit', 'Inter', sans-serif",
          padding: "40px",
          boxSizing: "border-box",
        }}
      >
        {/* Header & Description */}
        <div style={{ maxWidth: "800px", margin: "0 auto 40px auto" }}>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 800,
              background: "linear-gradient(to right, #3b82f6, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: "0 0 10px 0",
            }}
          >
            react-lazy-hydration-hook
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "16px", lineHeight: "1.6" }}>
            This story simulates Server-Side Rendering (SSR). Initially, all buttons are loaded
            as static HTML without any hydration. When you interact with a button (hover, focus, or keyboard press),
            only that specific component is hydrated and becomes interactive.
          </p>
        </div>

        {/* Stats Section */}
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto 40px auto",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #334155",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>
              Total Elements
            </div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#3b82f6" }}>
              {componentIds.length}
            </div>
          </div>
          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #334155",
              textAlign: "center",
            }}
          >
            <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>
              Static (Non-Hydrated)
            </div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#f59e0b" }}>
              {staticCount}
            </div>
          </div>
          <div
            style={{
              background: "#1e293b",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid #334155",
              textAlign: "center",
              boxShadow: hydratedCount > 0 ? "0 0 15px rgba(16, 185, 129, 0.2)" : "none",
              borderColor: hydratedCount > 0 ? "#10b981" : "#334155",
              transition: "all 0.3s ease",
            }}
          >
            <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "8px" }}>
              Active (Hydrated)
            </div>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#10b981" }}>
              {hydratedCount}
            </div>
          </div>
        </div>

        {/* Buttons List Container */}
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{ fontSize: "20px", marginBottom: "20px", color: "#cbd5e1" }}>
            List of lazy-hydrated buttons (.map() rendering)
          </h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              background: "#1e293b",
              padding: "30px",
              borderRadius: "16px",
              border: "1px solid #334155",
              justifyContent: "center",
            }}
          >
            {componentIds.map((id) => (
              <div
                key={id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <StaticButton
                  id={id}
                  label={`Interact with me`}
                  didHydrate={() => handleHydrated(id)}
                  wrapperProps={{
                    className: "lazy-wrapper",
                  }}
                />
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    color: hydrationStatus[id] ? "#10b981" : "#f59e0b",
                    textTransform: "uppercase",
                  }}
                >
                  {hydrationStatus[id] ? "● Active" : "○ Static"}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "40px",
              padding: "20px",
              borderRadius: "12px",
              border: "1px dashed #4b5563",
              background: "rgba(30, 41, 59, 0.5)",
              color: "#94a3b8",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
          >
            <strong>Hover, focus (using Tab key), or press keys</strong> on any of the buttons to trigger its hydration. Notice that only the button you interact with gets hydrated (the label changes status and its design transforms).
          </div>
        </div>
      </div>
    );
  },
};
