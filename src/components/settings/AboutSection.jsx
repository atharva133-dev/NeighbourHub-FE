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
      <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">About NeighbourHub</h2>
      <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
        A real-time community notice board for neighbours to share updates, events, and alerts.
      </p>

      <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
        <p className="text-sm text-slate-700 dark:text-slate-300">
          <span className="font-bold text-slate-900 dark:text-white">Version:</span> 1.0.0
        </p>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
          <span className="font-bold text-slate-900 dark:text-white">Built with</span>{' '}
          <Heart className="inline h-4 w-4 text-red-500 mx-1" /> for communities
        </p>
      </div>

      <div className="mb-8">
        <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Tech Stack</h3>
        <div className="flex flex-wrap gap-2.5">
          {TECH_STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-200 shadow-sm"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <a
          href="mailto:support@neighbourhub.app?subject=Bug%20Report"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <Bug className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          Report a Bug
          <ExternalLink className="ml-auto h-4 w-4 text-slate-400" />
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
        >
          <ExternalLink className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          View on GitHub
        </a>
      </div>
    </div>
  );
}
