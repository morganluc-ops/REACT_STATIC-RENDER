import { createLazyFileRoute } from '@tanstack/react-router'
import { styled } from '../stitches.config'

export const Route = createLazyFileRoute('/installation')({
  component: Installation,
})

const Title = styled('h1', {
  fontSize: '2.5rem',
  marginBottom: '$3',
})

const CodeBlock = styled('pre', {
  backgroundColor: '#282c34',
  color: '#abb2bf',
  padding: '$4',
  borderRadius: '8px',
  fontFamily: '$code',
  overflowX: 'auto',
  marginBottom: '$4',
})

function Installation() {
  return (
    <div>
      <Title>Installation</Title>
      <p style={{ marginBottom: '16px' }}>
        Installez <code>react-lazy-hydration-hook</code> via votre gestionnaire de paquets préféré.
      </p>
      
      <CodeBlock>
        npm install react-lazy-hydration-hook
      </CodeBlock>
      
      <p style={{ marginBottom: '16px' }}>Ou avec Yarn :</p>
      
      <CodeBlock>
        yarn add react-lazy-hydration-hook
      </CodeBlock>
    </div>
  )
}
