import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const socialLinks = [
  {
    name: "Twitter",
    href: "#",
    icon: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"/>
      </svg>
    )
  },
  {
    name: "Instagram",
    href: "#",
    icon: (
      <svg className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    )
  },
  {
    name: "Facebook",
    href: "#",
    icon: (
      <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    )
  }
];

export default function Footer() {
  return (
    <footer className="bg-[#050816] text-white pt-20 pb-10 border-t border-slate-900">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-slate-900">
          
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="relative h-20 w-20 overflow-hidden">
                <img
                  src="/logo2.png"
                  alt="NeighbourHub Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-[#FCFBF6]">
                Neighbour<span className="bg-gradient-to-r from-[#6E8F73] via-[#C97B5A] to-[#A8442F] bg-clip-text text-transparent">Hub</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-[rgba(252,251,246,0.7)] max-w-sm">
              The real-time community platform for buildings, colleges, and organizations. Share updates, manage amenities, and stay connected instantly.
            </p>
            <div className="flex gap-4 text-[rgba(252,251,246,0.7)]">
              {socialLinks.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  className="p-2 rounded-lg bg-[rgba(32,38,31,0.5)] hover:bg-[#C97B5A] hover:text-white transition-all duration-200"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-[rgba(252,251,246,0.9)]">Product</h3>
            <ul className="space-y-2.5 text-sm text-[rgba(252,251,246,0.7)]">
              <li><a href="#features" className="hover:text-[#FCFBF6] transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-[#FCFBF6] transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-[#FCFBF6] transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-[#FCFBF6] transition-colors">Changelog</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-[rgba(252,251,246,0.9)]">For Communities</h3>
            <ul className="space-y-2.5 text-sm text-[rgba(252,251,246,0.7)]">
              <li><a href="#cta" className="hover:text-[#FCFBF6] transition-colors">Building Societies</a></li>
              <li><a href="#cta" className="hover:text-[#FCFBF6] transition-colors">Colleges & Schools</a></li>
              <li><a href="#cta" className="hover:text-[#FCFBF6] transition-colors">Organizations</a></li>
              <li><a href="#cta" className="hover:text-[#FCFBF6] transition-colors">Create Community</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-[rgba(252,251,246,0.9)]">Resources</h3>
            <ul className="space-y-2.5 text-sm text-[rgba(252,251,246,0.7)]">
              <li><a href="#" className="hover:text-[#FCFBF6] transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-[#FCFBF6] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[#FCFBF6] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#FCFBF6] transition-colors">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-10 text-xs text-[rgba(252,251,246,0.7)]">
          <p>© {new Date().getFullYear()} NeighbourHub. All rights reserved.</p>
          
          <div className="flex items-center gap-2 w-full max-w-sm">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-[rgba(32,38,31,0.5)] border border-[rgba(32,38,31,0.3)] rounded-lg px-4 py-2 text-white placeholder-[rgba(252,251,246,0.5)] focus:outline-none focus:border-[#C97B5A] transition-colors text-xs"
            />
            <button className="rounded-lg bg-[#C97B5A] hover:bg-[#A85C3F] text-white font-bold px-4 py-2 flex items-center gap-1 transition-colors">
              <span>Subscribe</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
