import React from 'react';
import { styled } from '../stitches.config';
import { Search, Moon, Globe } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const GithubIcon = ({ size = 24, ...props }: { size?: number; [key: string]: any }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4" />
  </svg>
);

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
});

const Header = styled('header', {
  height: '60px',
  borderBottom: '1px solid $border',
  display: 'flex',
  alignItems: 'center',
  padding: '0 $4',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  backgroundColor: '$bg',
  zIndex: 10,
});

const Logo = styled('div', {
  fontWeight: 'bold',
  fontSize: '1.2rem',
  color: '$primary',
  display: 'flex',
  alignItems: 'center',
  gap: '$2',
});

const Main = styled('main', {
  display: 'flex',
  flex: 1,
});

const Sidebar = styled('aside', {
  width: '250px',
  borderRight: '1px solid $border',
  padding: '$4',
  display: 'none',
  '@media (min-width: 768px)': {
    display: 'block',
  },
});

const Content = styled('div', {
  flex: 1,
  padding: '$5',
  maxWidth: '800px',
  margin: '0 auto',
});

const RightSidebar = styled('aside', {
  width: '200px',
  padding: '$4',
  display: 'none',
  '@media (min-width: 1024px)': {
    display: 'block',
  },
});

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Container>
      <Header>
        <Logo>⚛️ useStatic Docs</Logo>
        <div style={{ display: 'flex', gap: '16px', color: '#4b5563' }}>
          <Search size={20} />
          <Globe size={20} />
          <Moon size={20} />
          <GithubIcon size={20} />
        </div>
      </Header>
      <Main>
        <Sidebar>
          <h4 style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Démarrage</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <li>
              <Link to="/" style={{ display: 'block', padding: '6px 8px', borderRadius: '4px', color: 'inherit' }} activeProps={{ style: { color: '#087ea4', fontWeight: 'bold', backgroundColor: '#e6f7ff' } }}>Démarrage rapide</Link>
            </li>
            <li>
              <Link to="/installation" style={{ display: 'block', padding: '6px 8px', borderRadius: '4px', color: 'inherit' }} activeProps={{ style: { color: '#087ea4', fontWeight: 'bold', backgroundColor: '#e6f7ff' } }}>Installation</Link>
            </li>
          </ul>
        </Sidebar>
        <Content>{children}</Content>
        <RightSidebar>
          <h4 style={{ color: '#6b7280', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>Dans cette page</h4>
          <ul style={{ listStyle: 'none', fontSize: '0.9rem', color: '#4b5563' }}>
            <li style={{ padding: '4px 0', borderLeft: '2px solid $primary', paddingLeft: '8px', color: '$text', fontWeight: 500 }}>Survol</li>
            <li style={{ padding: '4px 0', paddingLeft: '10px' }}>Créer et imbriquer</li>
            <li style={{ padding: '4px 0', paddingLeft: '10px' }}>Live Demo</li>
          </ul>
        </RightSidebar>
      </Main>
    </Container>
  );
};
