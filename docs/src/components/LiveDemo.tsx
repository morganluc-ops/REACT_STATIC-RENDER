import { useState, useEffect, useRef } from 'react';
import { styled } from '../stitches.config';
import { useStatic } from 'react-lazy-hydration-hook';

const DemoContainer = styled('div', {
  display: 'flex',
  border: '1px solid $border',
  borderRadius: '8px',
  overflow: 'hidden',
  marginTop: '$4',
  marginBottom: '$4',
  minHeight: '350px',
});

const CodePanel = styled('div', {
  flex: '0 0 50%',
  backgroundColor: '#282c34',
  color: '#abb2bf',
  padding: '$4',
  fontFamily: '$code',
  fontSize: '0.85rem',
  overflowX: 'auto',
});

const PreviewPanel = styled('div', {
  flex: '0 0 50%',
  backgroundColor: '$bg',
  padding: '$4',
  display: 'flex',
  flexDirection: 'column',
  gap: '$3',
});

const Header = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '$2',
  marginBottom: '$2',
  borderBottom: '1px solid $border',
  paddingBottom: '$2',
});

const HeavyItem = ({ index }: { index: number }) => {
  // Simulate heavy render (1ms per item)
  const start = performance.now();
  while (performance.now() - start < 1) { }
  return <div style={{ border: '1px solid #ccc', padding: '4px', margin: '2px', fontSize: '10px', borderRadius: '4px' }}>Item {index}</div>;
};

const LazyHeavyItem = useStatic(HeavyItem, { on: ['pointerover', 'click'] });

export const LiveDemo = () => {
  const [mode, setMode] = useState<'normal' | 'lazy'>('lazy');
  const [renderTime, setRenderTime] = useState<number | null>(null);
  const [items, setItems] = useState<number[]>([]);
  const renderStart = useRef<number>(0);

  const handleRender = () => {
    setItems([]);
    setRenderTime(null);
    setTimeout(() => {
      renderStart.current = performance.now();
      setItems(Array.from({ length: 100 }).map((_, i) => i));
    }, 50);
  };

  useEffect(() => {
    if (items.length > 0) {
      setRenderTime(Math.round(performance.now() - renderStart.current));
    }
  }, [items]);

  return (
    <div style={{ marginTop: '40px' }}>
      <h2 style={{ borderBottom: '1px solid #ebecf0', paddingBottom: '8px', marginBottom: '16px' }}>Démonstration Interactive</h2>
      <p>Comparez le temps de rendu (blocage du Main Thread) avec et sans l'hydratation différée.
        Dans cet exemple, chaque élément met 1ms à s'hydrater.</p>

      <DemoContainer>
        <CodePanel>
          <pre style={{ margin: 0, lineHeight: 1.5 }}>
            {`import { useStatic } from 'react-lazy-hydration-hook';

// Composant lourd (1ms / item)
const HeavyItem = () => <div>Item</div>;

// Version Lazy
const LazyItem = useStatic(HeavyItem, {
  on: ['pointerover', 'click']
});

// Boucle sur 100 éléments
{items.map(i => (
  mode === 'lazy' 
    ? <LazyItem key={i} /> 
    : <HeavyItem key={i} />
))}`}
          </pre>
        </CodePanel>

        <PreviewPanel>
          <Header>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
                style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }}
              >
                <option value="lazy">⚡ Avec useStatic</option>
                <option value="normal">🐢 Classique</option>
              </select>
              <button
                onClick={handleRender}
                style={{ padding: '6px 12px', cursor: 'pointer', backgroundColor: '#087ea4', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                Générer 100 éléments
              </button>
            </div>

            <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: renderTime && renderTime > 50 ? '#dc2626' : '#16a34a' }}>
              Temps de blocage : {renderTime !== null ? `${renderTime} ms` : '-'}
            </div>
          </Header>

          <div style={{ flex: 1, overflowY: 'auto', maxHeight: '250px', display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start' }}>
            {items.map(i => (
              mode === 'lazy'
                ? <LazyHeavyItem key={i} index={i} />
                : <HeavyItem key={i} index={i} />
            ))}
          </div>
        </PreviewPanel>
      </DemoContainer>
    </div>
  );
};
