import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(32,38,31,0.12)] bg-[#FCFBF6]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-24 items-center justify-between px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative h-20 w-20 overflow-hidden">
              <img
                src="/logo2.png"
                alt="NeighbourHub Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#20261F]">
              Neighbour<span className="bg-gradient-to-r from-[#6E8F73] via-[#C97B5A] to-[#A8442F] bg-clip-text text-transparent">Hub</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-[15px] font-semibold text-[rgba(32,38,31,0.7)] hover:text-[#20261F] transition-colors"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-[15px] font-semibold text-[rgba(32,38,31,0.7)] hover:text-[#20261F] transition-colors"
          >
            How It Works
          </a>
          <div className="relative group cursor-pointer flex items-center gap-1 text-[15px] font-semibold text-[rgba(32,38,31,0.7)] hover:text-[#20261F] transition-colors">
            <span>For Communities</span>
            <ChevronDown className="h-4 w-4 text-[rgba(32,38,31,0.5)] group-hover:text-[#20261F] transition-colors" />
          </div>
          <a
            href="#pricing"
            className="text-[15px] font-semibold text-[rgba(32,38,31,0.7)] hover:text-[#20261F] transition-colors"
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="text-[15px] font-semibold text-[rgba(32,38,31,0.7)] hover:text-[#20261F] transition-colors"
          >
            FAQ
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-5">
          <Link
            to="/login"
            className="text-[15px] font-semibold text-[rgba(32,38,31,0.7)] hover:text-[#20261F] transition-colors"
          >
            Log in
          </Link>
          <a
            href="#cta"
            className="rounded-xl bg-[#C97B5A] px-5 py-2.5 text-[15px] font-semibold text-white shadow-md shadow-[#C97B5A]/20 hover:bg-[#A85C3F] hover:shadow-[#C97B5A]/30 transition-all hover:scale-[1.02]"
          >
            Get Started
          </a>
        </div>
      </div>
    </header>
  );
}
