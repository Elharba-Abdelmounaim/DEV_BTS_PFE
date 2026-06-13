import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';

console.log('🔥 AppShell loaded');

export default function AppShell() {
  console.log('🔥 AppShell rendering');
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <main style={{ flex: 1, padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}