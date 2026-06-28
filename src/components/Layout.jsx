import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

export default function Layout({ children, onSearchChange }) {
  return (
    <div className="min-h-screen bg-[#0f0f1a] app-shell">
      <Navbar onSearchChange={onSearchChange || (() => {})} />
      
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 relative z-10">
        {children}
      </main>
    </div>
  );
}
