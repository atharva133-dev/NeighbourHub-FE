import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function IntroLoader({ onComplete }) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef(null);
  const logoRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const isLoaded = sessionStorage.getItem("neighbourhub-intro-loaded");
    if (!isLoaded) {
      setVisible(true);
    } else {
      onComplete();
    }
  }, [onComplete]);

  useGSAP(
    () => {
      if (!visible) return;

      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem("neighbourhub-intro-loaded", "true");
          setVisible(false);
          onComplete();
        }
      });

      tl.fromTo(
        logoRef.current,
        { scale: 0.3, rotationY: -180, rotationX: 45, opacity: 0 },
        { scale: 1, rotationY: 0, rotationX: 0, opacity: 1, duration: 1.2, ease: "back.out(1.7)" }
      )
        .fromTo(
          textRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.5"
        )
        .to({}, { duration: 0.6 })
        .to(logoRef.current, {
          rotationY: 180,
          scale: 0.8,
          opacity: 0,
          duration: 0.8,
          ease: "power2.inOut"
        })
        .to(
          containerRef.current,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
            duration: 1.0,
            ease: "power4.inOut"
          },
          "-=0.4"
        );
    },
    { scope: containerRef, dependencies: [visible] }
  );

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050816] text-white"
      style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}
    >
      <div className="flex flex-col items-center gap-6 perspective-1000">
        <div
          ref={logoRef}
          className="relative h-28 w-28 overflow-hidden rounded-3xl bg-[#20261F]/80 border border-[#6E8F73]/20 p-2 shadow-2xl shadow-[#6E8F73]/25 flex items-center justify-center transform-style-3d"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-[#6E8F73]/10 via-[#C97B5A]/10 to-[#A8442F]/10" />
          <img
            src="/logo2.png"
            alt="Logo"
            width={96}
            height={96}
            className="object-contain"
          />
        </div>
        <h1
          ref={textRef}
          className="text-3xl font-extrabold tracking-tight text-white/90"
        >
          Neighbour<span className="bg-gradient-to-r from-[#6E8F73] via-[#C97B5A] to-[#A8442F] bg-clip-text text-transparent">Hub</span>
        </h1>
      </div>
    </div>
  );
}
