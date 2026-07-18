import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Bell, KeyRound, ShieldCheck, Sparkles } from 'lucide-react';

export default function Auth3DVisualPanel() {
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(() => {
    const container = containerRef.current;
    const card = cardRef.current;
    if (!container || !card) return;

    const onMouseMove = (e) => {
      const bounds = container.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;

      const rotateY = (mouseX / bounds.width - 0.5) * 36;
      const rotateX = (mouseY / bounds.height - 0.5) * -36;

      gsap.to(card, {
        rotationY: rotateY,
        rotationX: rotateX,
        transformPerspective: 1600,
        ease: "power2.out",
        duration: 0.6
      });
    };

    const onMouseLeave = () => {
      gsap.to(card, {
        rotationY: 0,
        rotationX: 0,
        ease: "power3.out",
        duration: 0.8
      });
    };

    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);

    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
    };
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="relative hidden h-full w-full flex-col items-center justify-center overflow-hidden p-10 lg:flex bg-gradient-to-tr from-[#c026ff] via-[#8b5cf6] to-[#3b82f6]"
    >
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
        {Array.from({ length: 25 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white/40"
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `auth-float ${Math.random() * 4 + 4}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center mb-12">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-[24px] bg-white/10 border border-white/20 backdrop-blur-md shadow-inner overflow-hidden">
          <img src="/logo2.png" alt="NeighbourHub Logo" className="h-full w-full object-contain p-2" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white xl:text-6xl" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
          NeighbourHub
        </h1>
        <p className="mt-4 text-xl text-white/90 max-w-md mx-auto font-medium tracking-wide">
          Your community, connected in real time.
        </p>
      </div>

      <div className="relative flex items-center justify-center w-full max-w-[440px] h-[460px] z-20">
        <div
          ref={cardRef}
          className="relative w-full h-full rounded-[28px] p-8 flex flex-col justify-between overflow-visible"
          style={{
            transformStyle: 'preserve-3d',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2) inset'
          }}
        >
          {/* Top Header */}
          <div className="flex justify-between items-start" style={{ transform: 'translateZ(50px)' }}>
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 border border-white/30 text-white shadow-lg">
                  <ShieldCheck size={24} />
                </span>
              </div>
              <div>
                <p className="text-base font-bold text-white tracking-wide">Secure Access</p>
                <p className="text-xs text-white/80 font-medium uppercase tracking-wider mt-0.5">Admin Verified</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3.5 py-1.5 text-xs font-bold text-white uppercase tracking-widest shadow-lg">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white"></span>
              </span>
              Live Feed
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-5" style={{ transform: 'translateZ(70px)' }}>
            {[
              { icon: Bell, title: 'Real-Time Notices', sub: 'Instant building alerts', color: 'text-white' },
              { icon: Sparkles, title: 'AI Moderation', sub: 'Clean, sorted feeds', color: 'text-white' },
              { icon: KeyRound, title: 'Seamless Join', sub: 'Secure 6-digit codes', color: 'text-white' }
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md shadow-lg transition-colors hover:bg-white/20"
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 shadow-inner ${feature.color}`}>
                  <feature.icon size={22} />
                </span>
                <div>
                  <p className="text-sm font-bold text-white">{feature.title}</p>
                  <p className="text-xs font-medium text-white/80 mt-0.5">{feature.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Footer of Card */}
          <div className="flex justify-between items-center pt-4 border-t border-white/20" style={{ transform: 'translateZ(30px)' }}>
            <p className="text-xs text-white/80 font-mono tracking-widest uppercase">Community Engine</p>
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-8 w-8 rounded-full border-2 border-[#8b5cf6] bg-white/30 backdrop-blur-sm shadow-md" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
