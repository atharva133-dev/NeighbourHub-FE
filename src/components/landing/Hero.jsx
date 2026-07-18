import { useRef } from "react";
import { motion } from "framer-motion";
import { Shield, Sparkles, MessageSquare, Star, ArrowRight, Play, Calendar, UserCheck, Bell, Tag } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Hero() {
  const sectionRef = useRef(null);
  const cardContainerRef = useRef(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const cardContainer = cardContainerRef.current;
    if (!section || !cardContainer) return;

    const onMouseMove = (e) => {
      const bounds = section.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const rotateY = (mouseX / bounds.width - 0.5) * 20; // 3D tilt Y rotation
      const rotateX = (mouseY / bounds.height - 0.5) * -20; // 3D tilt X rotation

      gsap.to(cardContainer, {
        rotationY: rotateY,
        rotationX: rotateX,
        transformPerspective: 1000,
        ease: "power2.out",
        duration: 0.6
      });
    };

    const onMouseLeave = () => {
      gsap.to(cardContainer, {
        rotationY: 0,
        rotationX: 0,
        ease: "power3.out",
        duration: 0.8
      });
    };

    section.addEventListener("mousemove", onMouseMove);
    section.addEventListener("mouseleave", onMouseLeave);

    return () => {
      section.removeEventListener("mousemove", onMouseMove);
      section.removeEventListener("mouseleave", onMouseLeave);
    };
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-[#F6F5EF] pt-8 pb-16 lg:pt-12 lg:pb-24">
      {/* Decorative Light Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6E8F73]/10 glow-orb z-0" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#C97B5A]/10 glow-orb z-0" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Content Column */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5 flex flex-col gap-8 text-center lg:text-left"
          >
            {/* Tag Badges Row */}
            <div className="flex flex-nowrap gap-2 justify-center lg:justify-start overflow-x-auto no-scrollbar pb-1 lg:pb-0">
              {[
                { icon: MessageSquare, label: "Real-time Updates" },
                { icon: Shield, label: "Smart & Secure" },
                { icon: Sparkles, label: "AI-Powered" }
              ].map((badge, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 shrink-0 rounded-full border border-[#E4EBE1] bg-[#FCFBF6] px-3 py-1.5 text-xs font-semibold text-[#20261F]"
                >
                  <badge.icon className="h-3.5 w-3.5 text-[#6E8F73]" />
                  <span>{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-extrabold tracking-tight text-[#20261F] sm:text-6xl leading-[1.1]">
              Your Community, Connected in{" "}
              <span className="bg-gradient-to-r from-[#6E8F73] via-[#C97B5A] to-[#A8442F] bg-clip-text text-transparent">
                Real Time
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg leading-8 text-[rgba(32,38,31,0.7)] max-w-xl mx-auto lg:mx-0 font-medium">
              NeighbourHub is a modern community platform for buildings, colleges, and organizations to share updates, manage amenities, and stay connected — instantly.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <LinkButton href="/login" primary>
                Get Started for Free
                <ArrowRight className="h-4 w-4 ml-1" />
              </LinkButton>
              <LinkButton href="#showcase">
                <Play className="h-4 w-4 mr-2 fill-current" />
                Book & Demo
              </LinkButton>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start border-t border-slate-100 pt-6 mt-2">
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80"
                ].map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt="User avatar"
                    className="h-10 w-10 rounded-full border-2 border-[#FCFBF6] object-cover shadow-xs"
                  />
                ))}
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#FCFBF6] bg-[#20261F] text-xs font-bold text-white shadow-xs">
                  +2K
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-1 justify-center sm:justify-start text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                  <span className="ml-1.5 font-bold text-[#20261F] text-sm">4.9/5</span>
                </div>
                <p className="text-xs font-semibold text-[rgba(32,38,31,0.5)] mt-0.5">Trusted by 2,000+ communities</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Phone Mockup & Floating Cards */}
          <div className="lg:col-span-7 relative flex justify-center lg:justify-end min-h-[660px] w-full pt-0">
            
            {/* Shift Container 25% to the left on Desktop */}
            <div className="relative w-full max-w-[460px] lg:-translate-x-[25%] flex justify-center items-center">
              
              {/* Soft glow behind the phone mockup */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-[#6E8F73]/15 rounded-full blur-3xl z-0 pointer-events-none" />

              {/* Relative wrapper holding the iPhone and its floating cards, animated with 3D Mouse Move tilt */}
              <div ref={cardContainerRef} className="relative transform-style-3d">
                {/* iPhone Mockup Frame (iPhone 16 Pro Black Titanium Look) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="relative w-[305px] h-[610px] rounded-[52px] border-[10px] border-[#22252a] bg-black shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] z-10 flex flex-col overflow-hidden animate-float ring-1 ring-inset ring-white/10"
                >
                  {/* Physical button details */}
                  <div className="absolute left-[-10px] top-24 w-[2px] h-10 bg-slate-800 rounded-r-xs z-50" />
                  <div className="absolute left-[-10px] top-38 w-[2px] h-14 bg-slate-800 rounded-r-xs z-50" />
                  <div className="absolute left-[-10px] top-56 w-[2px] h-14 bg-slate-800 rounded-r-xs z-50" />
                  <div className="absolute right-[-10px] top-32 w-[2px] h-18 bg-slate-800 rounded-l-xs z-50" />

                  {/* Dynamic Island */}
                  <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-3">
                    <div className="w-2 h-2 rounded-full bg-[#0c0d10]" />
                    <div className="w-3.5 h-1 rounded-full bg-[#0c0d10]" />
                  </div>

                  {/* Status Bar */}
                  <div className="h-12 w-full bg-[#FCFBF6] flex items-end justify-between px-6 pb-1 text-[11px] font-semibold text-[#20261F] z-10">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#20261F]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.07 19.58 10.48 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
                      </svg>
                      <span className="text-[#20261F]">LTE</span>
                      <div className="w-5 h-2.5 border border-[#20261F] rounded-xs p-0.5 flex items-center">
                        <div className="h-full w-3 bg-[#20261F] rounded-3xs" />
                      </div>
                    </div>
                  </div>

                  {/* App Screen Content */}
                  <div className="flex-1 bg-[#FCFBF6] flex flex-col p-4 overflow-y-auto pt-1 no-scrollbar text-xs text-[#20261F]">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-sm text-[#20261F]">Sunshine Apartments</span>
                      <Bell className="h-4 w-4 text-[rgba(32,38,31,0.5)]" />
                    </div>

                    <div className="w-full bg-[#E4EBE1] rounded-lg p-2 text-[rgba(32,38,31,0.5)] mb-3 text-[11px]">
                      Search posts, people, amenities...
                    </div>

                    <div className="flex gap-1.5 mb-4">
                      {["All", "Important", "Events", "General"].map((tab, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1 rounded-full text-[10px] font-semibold ${
                            i === 0 ? "bg-[#6E8F73] text-white" : "bg-[#E4EBE1] text-[#20261F]"
                          }`}
                        >
                          {tab}
                        </span>
                      ))}
                    </div>

                    {/* Feed Item 1 (Admin Post Pinned) */}
                    <div className="border border-[rgba(32,38,31,0.12)] rounded-xl p-3 mb-3 bg-[#FCFBF6] shadow-xs">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2 items-center">
                          <img
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=60&h=60&q=80"
                            className="h-6 w-6 rounded-full object-cover"
                            alt=""
                          />
                          <div>
                            <div className="font-bold text-[#20261F]">Admin</div>
                            <div className="text-[9px] text-[rgba(32,38,31,0.5)]">2m ago</div>
                          </div>
                        </div>
                        <span className="text-[9px] bg-[#EAD6CE] text-[#A8442F] font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <Tag className="h-2.5 w-2.5" /> Pinned
                        </span>
                      </div>
                      <div className="font-semibold text-[#20261F] mb-1">Water Supply Maintenance</div>
                      <div className="text-[11px] text-[rgba(32,38,31,0.7)] mb-2 leading-relaxed">
                        Water supply will be unavailable on 15th May from 10:00 PM to 6:00 AM.
                      </div>
                      <img
                        src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&h=200&q=80"
                        className="w-full h-24 rounded-lg object-cover mb-2"
                        alt=""
                      />
                      <div className="flex gap-4 text-[10px] text-[rgba(32,38,31,0.5)] font-semibold">
                        <span>👍 24</span>
                        <span>💬 5</span>
                      </div>
                    </div>

                    {/* Feed Item 2 (Event) */}
                    <div className="border border-[rgba(32,38,31,0.12)] rounded-xl p-3 bg-[#FCFBF6] shadow-xs">
                      <div className="flex gap-2 items-center mb-2">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=60&h=60&q=80"
                          className="h-6 w-6 rounded-full object-cover"
                          alt=""
                        />
                        <div>
                          <div className="font-bold text-[#20261F]">Community Event</div>
                          <div className="text-[9px] text-[rgba(32,38,31,0.5)]">5m ago</div>
                        </div>
                      </div>
                      <div className="font-semibold text-[#20261F] mb-1">Yoga Session</div>
                      <div className="text-[11px] text-[rgba(32,38,31,0.7)] leading-relaxed">
                        Join us for a relaxing yoga session this Sunday at the Clubhouse.
                      </div>
                    </div>
                  </div>

                  {/* Bottom Tab Bar */}
                  <div className="h-14 border-t border-[rgba(32,38,31,0.12)] bg-[#FCFBF6] flex items-around justify-between px-6 py-2 text-[10px] font-medium text-[rgba(32,38,31,0.5)]">
                    <div className="flex flex-col items-center text-[#6E8F73] animate-pulse">
                      <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      <span>Home</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Groups</span>
                    </div>
                    <div className="relative -top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#C97B5A] text-white shadow-lg shadow-[#C97B5A]/20">
                      <span className="text-xl font-bold">+</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Bookings</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Cards (Positioned Absolutely RELATIVE to the iPhone container itself) */}

                {/* Card 1: Amenity Booking (Top-Left) */}
                <motion.div
                  initial={{ opacity: 0, x: -30, y: -10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="absolute right-[106%] top-[12%] z-20 w-48 rounded-2xl border border-[rgba(32,38,31,0.12)] bg-[#FCFBF6] p-4 shadow-xl shadow-[#6E8F73]/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E4EBE1] text-[#6E8F73]">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[rgba(32,38,31,0.5)] uppercase tracking-wider">Amenity Booking</div>
                      <div className="text-xs font-bold text-[#20261F]">Clubhouse</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-[rgba(32,38,31,0.7)] mb-2">May 18, 5:00 PM</div>
                  <span className="inline-block rounded-full bg-[#E4EBE1] px-2 py-0.5 text-[9px] font-bold text-[#6E8F73]">
                    Booked
                  </span>
                </motion.div>

                {/* Card 2: New Members (Bottom-Left) */}
                <motion.div
                  initial={{ opacity: 0, x: -30, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="absolute right-[106%] top-[56%] z-20 w-48 rounded-2xl border border-[rgba(32,38,31,0.12)] bg-[#FCFBF6] p-4 shadow-xl shadow-[#6E8F73]/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#E4EBE1] text-[#6E8F73]">
                      <UserCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[rgba(32,38,31,0.5)] uppercase tracking-wider">New Members</div>
                      <div className="text-xs font-bold text-[#20261F]">12 new requests</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-2">
                      {["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=40&h=40&q=80", "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=40&h=40&q=80", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=40&h=40&q=80"].map((src, i) => (
                        <img key={i} src={src} className="h-5 w-5 rounded-full border border-[#FCFBF6] object-cover" alt="" />
                      ))}
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#E4EBE1] text-[8px] font-bold text-[#6E8F73] border border-[#FCFBF6]">
                        +12
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Card 3: Real-time Updates (Top-Right) */}
                <motion.div
                  initial={{ opacity: 0, x: 30, y: -10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="absolute left-[106%] top-[18%] z-20 w-52 rounded-2xl border border-[rgba(32,38,31,0.12)] bg-[#FCFBF6] p-4 shadow-xl shadow-[#C97B5A]/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F3DFD1] text-[#C97B5A]">
                      <Bell className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[rgba(32,38,31,0.5)] uppercase tracking-wider">Real-time Updates</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-[10px] text-[rgba(32,38,31,0.7)]">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-1.5">
                      <span className="font-semibold text-[#20261F]">General Updates</span>
                      <span className="text-[8px] text-[rgba(32,38,31,0.5)]">Just now</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#20261F]">Package Delivered</span>
                      <span className="text-[8px] text-[rgba(32,38,31,0.5)]">10m ago</span>
                    </div>
                  </div>
                </motion.div>

                {/* Card 4: AI Categorized (Bottom-Right) */}
                <motion.div
                  initial={{ opacity: 0, x: 30, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="absolute left-[106%] top-[52%] z-20 w-44 rounded-2xl border border-[rgba(32,38,31,0.12)] bg-[#FCFBF6] p-4 shadow-xl shadow-[#C97B5A]/10"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EAD6CE] text-[#A8442F]">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-[rgba(32,38,31,0.5)] uppercase tracking-wider">AI Categorized</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-[rgba(32,38,31,0.7)] leading-relaxed">
                    Automatically sorted and tagged into channels
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LinkButton({ children, href, primary = false }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-[15px] font-bold transition-all duration-200 hover:scale-[1.02] ${
        primary
          ? "bg-[#C97B5A] text-white shadow-md shadow-[#C97B5A]/10 hover:bg-[#A85C3F] hover:shadow-[#C97B5A]/20"
          : "border border-[rgba(32,38,31,0.12)] bg-[#FCFBF6] text-[#20261F] shadow-xs hover:bg-[#E4EBE1]"
      }`}
    >
      {children}
    </a>
  );
}
