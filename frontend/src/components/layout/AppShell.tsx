import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import { memo } from 'react';



function AppShell() {

  
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

export default memo(AppShell);