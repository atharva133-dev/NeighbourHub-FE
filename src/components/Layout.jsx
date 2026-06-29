import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

export default function Layout({ children, onSearchChange }) {
  return (
    <div className="min-h-screen app-shell bg-slate-50 dark:bg-[#0f0f1a] transition-colors duration-500">
      <Navbar onSearchChange={onSearchChange || (() => {})} />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10 compact-main">
        {children}
      </main>
    </div>
  );
}
