import { ExternalLink, Bug, Heart } from 'lucide-react';

const TECH_STACK = [
  'React + Vite',
  'Tailwind CSS',
  'Node.js + Express',
  'MongoDB + Mongoose',
  'Socket.io',
  'JWT Auth',
  'Cloudinary',
];

export default function AboutSection() {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="mb-2 text-xl font-semibold text-white">About NeighbourHub</h2>
      <p className="mb-6 text-sm text-slate-400">
        A real-time community notice board for neighbours to share updates, events, and alerts.
      </p>

      <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm text-slate-300">
          <span className="font-medium text-white">Version:</span> 1.0.0
        </p>
        <p className="mt-1 text-sm text-slate-300">
          <span className="font-medium text-white">Built with</span>{' '}
          <Heart className="inline h-3.5 w-3.5 text-red-400" /> for communities
        </p>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-white">Tech Stack</h3>
        <div className="flex flex-wrap gap-2">
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-200"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <a
          href="mailto:support@neighbourhub.app?subject=Bug%20Report"
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <Bug className="h-4 w-4 text-purple-400" />
          Report a Bug
          <ExternalLink className="ml-auto h-3.5 w-3.5 text-slate-500" />
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <ExternalLink className="h-4 w-4 text-purple-400" />
          View on GitHub
        </a>
      </div>
    </div>
  );
}
