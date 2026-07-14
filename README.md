# React Lazy Hydration Hook

A lightweight React hook for lazy hydration of server-rendered components.

---

## 🚀 Installation

Via npm:
```bash
npm install react-lazy-hydration-hook
```

Via yarn:
```bash
yarn add react-lazy-hydration-hook
```

---

## 🎯 What is it?

`useStatic` is a React hook (Higher-Order Component) designed to **defer hydration** of server-side rendered (SSR) components. 
Instead of hydrating a component immediately during page load, it keeps it as pure static HTML until the user interacts with it (hover, click, keyboard focus).

---

## ⚙️ How?

By wrapping your components with `useStatic`, React skips client-side hydration until a user interaction occurs.

1. **Server-Side Rendering (SSR)**: The component renders normally on the server, generating full HTML (e.g., `<button>Click</button>`).
2. **Client-Side Hydration**: The wrapper renders an empty element with `dangerouslySetInnerHTML={{ __html: "" }}` and `suppressHydrationWarning`. React bypasses the DOM reconciliation for this node, leaving the server HTML intact.
3. **Interaction**: The wrapper listens for lightweight native events (such as `pointerover` or `focusin`).
4. **Actual Hydration**: Once an interaction is detected, the internal state updates, and React hydrates the full component tree, attaching all event handlers seamlessly.

---

## ⚡ Why?

Standard React hydration blocks the Main Thread. If a page contains hundreds of complex components, the browser freezes while React attaches event listeners.

- **FID (First Input Delay) / INP (Interaction to Next Paint) Optimization**: Minimizes initial JS execution so users can interact with your page much faster.
- **Main Thread Work Reduction**: Frees up the CPU for higher priority tasks like image loading and CSS animations.
- **Optimized SSR Performance**: Allows having visually rich, complex pages without the overhead of heavy initial JavaScript execution.

---

## 📊 Comparison

| Feature / Strategy | Standard Hydration | Lazy Loading (`React.lazy`) | `react-lazy-hydration-hook` |
|--------------------|--------------------|-----------------------------|-----------------------------|
| **SSR Support** | ✅ Yes | ❌ (Client fallback / Layout shifts) | ✅ Yes |
| **Initial Bundle Size** | 🛑 Heavy (includes all JS) | ✅ Light (code-splitting) | ✅ Light / Moderate |
| **Hydration Timing** | 🛑 Instantly on load (blocks main thread) | 🛑 Instantly when code loads | ✅ Deferred until user interaction |
| **UX Layout Shifts** | ✅ None | 🛑 Layout shift or loaders | ✅ None (server HTML is kept) |
| **SEO Friendly** | ✅ Yes | ❌ Harder for crawlers | ✅ Yes |

---

## 👥 Who is it for?

This hook is perfect for:
- **Infinite Scroll & E-commerce Grids** where only a few items are clicked by users.
- **Dashboards** featuring widgets with passive information.
- **Below the Fold Components** (e.g., footers, secondary panels) that don't need immediate interactivity.
- **Tooltips, Popovers, & Dropdowns** hidden on page load.

---

## 📖 API Reference

### `useStatic(Component, options?)`

Creates a lazy-hydrated version of your component.

#### Parameters

- **`Component`**: The React component to wrap.
- **`options`** (Optional): A configuration object.

#### Options (`LazyHydrationOptions`)

| Property | Type | Default | Description |
|-----------|------|--------|-------------|
| `on` | `string \| string[]` | `['pointerover', 'pointerdown', 'focusin', 'keydown', 'click']` | DOM events that will trigger hydration. |
| `ssrOnly` | `boolean` | `false` | If set to `true`, the component will **never** hydrate, even on interaction. Perfect for 100% static components. |
| `noWrapper` | `boolean \| string` | `false` | By default, `useStatic` wraps the component in a `<div>`. You can customize the wrapper tag (e.g., `'span'`, `'article'`) or set to `true` to render without a wrapper (advanced usage). |
| `didHydrate` | `() => void` | `undefined` | Callback fired exactly once, immediately after the component hydrates. |

---

## 💡 Usage Example

```tsx
import { useStatic } from 'react-lazy-hydration-hook';

// 1. A heavy React component
const HeavyCard = ({ title, onClick }) => (
  <div className="card" onClick={onClick}>
    <h2>{title}</h2>
    {/* Other CPU-heavy rendering logic... */}
  </div>
);

// 2. Wrap it for lazy hydration
const StaticHeavyCard = useStatic(HeavyCard, {
  on: ['pointerover', 'focusin'], // Hydrates on hover or focus
  noWrapper: 'article' // Uses <article> as wrapper instead of <div>
});

// 3. Render it
export default function App() {
  return (
    <main>
      <h1>Product List</h1>
      <StaticHeavyCard title="Card 1" onClick={() => alert('Clicked!')} />
      <StaticHeavyCard title="Card 2" onClick={() => alert('Clicked!')} />
    </main>
  );
}
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).