const FEATURES = [
  { icon: '🔔', title: 'Real-time notices', desc: 'Stay updated instantly' },
  { icon: '👥', title: 'Community connect', desc: 'Know your neighbours' },
  { icon: '🚨', title: 'Instant emergency alerts', desc: 'Safety when it matters' },
];

export default function AuthVisualPanel() {
  return (
    <div className="auth-visual-panel relative hidden h-full flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14">
      <div className="auth-particles pointer-events-none absolute inset-0" aria-hidden="true">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="auth-particle absolute rounded-full bg-white/20"
            style={{
              width: `${4 + (i % 5) * 2}px`,
              height: `${4 + (i % 5) * 2}px`,
              left: `${(i * 17 + 5) % 95}%`,
              top: `${(i * 23 + 10) % 90}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${4 + (i % 4) * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <div className="auth-logo-glow mb-2 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-violet-700 text-2xl font-extrabold text-white shadow-2xl">
          NH
        </div>
        <h1 className="auth-logo-glow text-4xl font-extrabold tracking-tight text-white xl:text-5xl">
          NeighbourHub
        </h1>
        <p className="mt-3 max-w-sm text-lg text-purple-100/80">
          Your community, connected in real time
        </p>
      </div>

      <div className="relative z-10 space-y-4">
        {FEATURES.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
          >
            <span className="text-2xl">{icon}</span>
            <div>
              <p className="font-semibold text-white">{title}</p>
              <p className="text-sm text-purple-200/70">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 flex justify-center py-6">
        <div className="auth-floating-card w-full max-w-xs rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-300">
              Emergency
            </span>
            <span className="text-xs text-purple-200/60">Just now</span>
          </div>
          <p className="text-sm font-medium text-white">Power outage on Oak Street</p>
          <p className="mt-1 text-xs text-purple-200/70">Expected restore by 6 PM</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-500" />
            <span className="text-xs text-purple-200/80">Posted by Admin</span>
          </div>
        </div>
      </div>

      <p className="relative z-10 text-center text-sm font-medium tracking-wide text-purple-200/60">
        500+ Members · 1000+ Notices · Always Live
      </p>
    </div>
  );
}
