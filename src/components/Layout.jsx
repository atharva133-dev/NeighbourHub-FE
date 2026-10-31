import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function Layout({ children, onSearchChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Left Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Right: Topbar + Page content */}
      <div className="app-main">
        <Topbar
          onSearchChange={onSearchChange}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />

        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}
