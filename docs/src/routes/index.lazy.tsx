import { createLazyFileRoute } from '@tanstack/react-router'
import { styled } from '../stitches.config'

export const Route = createLazyFileRoute('/')({
  component: Index,
})

const Title = styled('h1', {
  fontSize: '2.5rem',
  marginBottom: '$3',
})

const SectionTitle = styled('h2', {
  fontSize: '1.8rem',
  marginTop: '$5',
  marginBottom: '$3',
  borderBottom: '1px solid $border',
  paddingBottom: '$2',
})

const SubTitle = styled('h3', {
  fontSize: '1.4rem',
  marginTop: '$4',
  marginBottom: '$2',
})

const Paragraph = styled('p', {
  marginBottom: '$3',
  lineHeight: 1.6,
})

const CodeBlock = styled('pre', {
  backgroundColor: '#282c34',
  color: '#abb2bf',
  padding: '$4',
  borderRadius: '8px',
  fontFamily: '$code',
  overflowX: 'auto',
  marginBottom: '$4',
  fontSize: '0.9rem',
})

const List = styled('ul', {
  marginLeft: '$4',
  marginBottom: '$4',
  lineHeight: 1.6,
})

const OrderedList = styled('ol', {
  marginLeft: '$4',
  marginBottom: '$4',
  lineHeight: 1.6,
})

const Table = styled('table', {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '$4',
  '& th, & td': {
    border: '1px solid $border',
    padding: '$2',
    textAlign: 'left',
  },
  '& th': {
    backgroundColor: '#f9fafb',
  }
})

function Index() {
  return (
    <div>
      <Title>React Lazy Hydration Hook</Title>
      <Paragraph>A lightweight React hook for lazy hydration of server-rendered components.</Paragraph>
      
      <SectionTitle>🎯 Quoi (What) ?</SectionTitle>
      <Paragraph>
        <code>useStatic</code> est un Hook (Higher-Order Component) React conçu pour <strong>différer l'hydratation</strong> des composants rendus côté serveur (SSR). 
        Plutôt que d'hydrater un composant immédiatement au chargement de la page, il le maintient sous forme de HTML statique pur jusqu'à ce que l'utilisateur interagisse avec lui (survol, clic, focus clavier).
      </Paragraph>

      <SectionTitle>⚡ Pourquoi (Why) ?</SectionTitle>
      <Paragraph>
        L'hydratation classique de React bloque le thread principal (Main Thread). Si votre page contient des centaines de composants complexes, le navigateur va figer la page pendant que React attache ses écouteurs d'événements.
      </Paragraph>
      <List>
        <li><strong>Optimisation du FID (First Input Delay) / INP (Interaction to Next Paint)</strong> : En réduisant le volume de composants à hydrater au lancement, l'utilisateur peut interagir avec votre site beaucoup plus rapidement.</li>
        <li><strong>Réduction du travail du Main Thread</strong> : Libère le processeur pour des tâches plus critiques (chargement d'images, animations CSS).</li>
        <li><strong>Meilleure performance SSR globale</strong> : Permet d'avoir des pages très lourdes visuellement mais très légères en exécution JavaScript initiale.</li>
      </List>

      <SectionTitle>👥 Pour qui (For whom) ?</SectionTitle>
      <Paragraph>Ce hook est idéal pour :</Paragraph>
      <List>
        <li>Les <strong>listes infinies</strong> et les <strong>grilles E-commerce</strong> où seules quelques cartes sont réellement cliquées par l'utilisateur.</li>
        <li>Les <strong>Tableaux de bord</strong> riches en widgets d'information passive.</li>
        <li>Les composants <strong>sous la ligne de flottaison</strong> (footer, sections secondaires) qui n'ont pas besoin d'être interactifs immédiatement.</li>
        <li>Les <strong>infobulles (Tooltips)</strong>, popovers et menus de navigation cachés.</li>
      </List>

      <SectionTitle>⚙️ Comment ça marche (How it works) ?</SectionTitle>
      <Paragraph>Le fonctionnement repose sur une astuce native de React :</Paragraph>
      <OrderedList>
        <li><strong>Rendu Serveur (SSR)</strong> : Le composant est rendu normalement. React génère le vrai code HTML (ex: <code>&lt;button&gt;Click&lt;/button&gt;</code>).</li>
        <li><strong>Hydratation (Client)</strong> : Au lieu d'hydrater l'enfant, le wrapper renvoie un élément avec <code>dangerouslySetInnerHTML={"{ __html: '' }"}</code> accompagné de <code>suppressHydrationWarning</code>. React ignore le contenu réel du DOM (laissant le HTML serveur intact).</li>
        <li><strong>Interaction</strong> : Le wrapper écoute des événements légers natifs (<code>pointerover</code>, <code>focusin</code>).</li>
        <li><strong>Hydratation Réelle</strong> : Dès qu'une interaction survient, l'état interne bascule et React remplace le composant statique par la vraie arborescence React, attachant ainsi tous les événements de manière transparente pour l'utilisateur.</li>
      </OrderedList>

      <SectionTitle>📖 API Reference</SectionTitle>
      <SubTitle><code>useStatic(Component, options?)</code></SubTitle>
      <Paragraph>Crée une version "lazy" de votre composant.</Paragraph>
      
      <Paragraph><strong>Paramètres</strong></Paragraph>
      <List>
        <li><strong><code>Component</code></strong> : Le composant React à envelopper.</li>
        <li><strong><code>options</code></strong> (Optionnel) : Un objet de configuration globale.</li>
      </List>

      <Paragraph><strong>Options (LazyHydrationOptions)</strong></Paragraph>
      <Table>
        <thead>
          <tr>
            <th>Propriété</th>
            <th>Type</th>
            <th>Défaut</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>on</code></td>
            <td><code>string | string[]</code></td>
            <td><code>['pointerover', 'pointerdown', 'focusin', 'keydown', 'click']</code></td>
            <td>Les événements natifs du DOM qui déclencheront l'hydratation.</td>
          </tr>
          <tr>
            <td><code>ssrOnly</code></td>
            <td><code>boolean</code></td>
            <td><code>false</code></td>
            <td>Si défini sur <code>true</code>, le composant ne s'hydratera <strong>jamais</strong>, même en cas d'interaction. Idéal pour du contenu 100% statique.</td>
          </tr>
          <tr>
            <td><code>noWrapper</code></td>
            <td><code>boolean | string</code></td>
            <td><code>false</code></td>
            <td>Par défaut, <code>useStatic</code> entoure le composant d'un <code>&lt;div&gt;</code>. Vous pouvez changer la balise (ex: <code>'span'</code>, <code>'section'</code>) ou passer <code>true</code> si le composant s'hydrate directement sans conteneur (usage avancé).</td>
          </tr>
          <tr>
            <td><code>didHydrate</code></td>
            <td><code>() =&gt; void</code></td>
            <td><code>undefined</code></td>
            <td>Un callback (fonction) appelé exactement une fois, immédiatement après la fin de l'hydratation.</td>
          </tr>
        </tbody>
      </Table>

      <SectionTitle>💡 Exemple d'utilisation</SectionTitle>
      <CodeBlock>
{`import { useStatic } from 'react-lazy-hydration-hook';

// 1. Un composant lourd normal
const HeavyCard = ({ title, onClick }) => (
  <div className="card" onClick={onClick}>
    <h2>{title}</h2>
    {/* Beaucoup d'autres éléments lourds... */}
  </div>
);

// 2. Création de la version lazy
const StaticHeavyCard = useStatic(HeavyCard, {
  on: ['pointerover', 'focusin'], // S'hydrate au survol ou au focus
  noWrapper: 'article' // Utilise <article> comme wrapper
});

// 3. Utilisation
export default function App() {
  return (
    <main>
      <h1>Liste de cartes</h1>
      <StaticHeavyCard title="Carte 1" onClick={() => alert('Cliqué!')} />
      <StaticHeavyCard title="Carte 2" onClick={() => alert('Cliqué!')} />
    </main>
  );
}`}
      </CodeBlock>
    </div>
  )
}

