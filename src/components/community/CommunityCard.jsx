import { Users, Shield, ArrowRight, Hash, Building2, GraduationCap, Globe } from 'lucide-react';

const GRADIENTS = [
  'from-purple-600 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-500',
  'from-violet-600 to-purple-500',
];

const TYPE_META = {
  society:        { label: 'Society / Building', Icon: Building2,     color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300' },
  college_school: { label: 'College / School',   Icon: GraduationCap, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' },
  other:          { label: 'Other',              Icon: Globe,         color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' },
};

function pickGradient(name = '') {
  const code = name.charCodeAt(0) || 0;
  return GRADIENTS[code % GRADIENTS.length];
}

export default function CommunityCard({ community, onEnter }) {
  const initials = community.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const gradient = pickGradient(community.name);
  const typeMeta = TYPE_META[community.type] || TYPE_META.other;
  const TypeIcon = typeMeta.Icon;

  return (
    <div className="community-card group glass-card relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 community-card-glow" />

      {/* Gradient banner header */}
      <div className={`relative h-24 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        {/* Large initial in header */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-black text-white/20 select-none tracking-tight">{initials}</span>
        </div>

        {/* Avatar overlapping the banner bottom */}
        <div className={`absolute -bottom-5 left-5 flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${gradient} text-lg font-black text-white shadow-xl ring-4 ring-white dark:ring-[#171725]`}>
          {community.avatar
            ? <img src={community.avatar} alt="" className="h-full w-full object-cover" />
            : initials
          }
        </div>

        {/* Admin badge top-right */}
        {community.isAdmin && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
            <Shield className="h-3 w-3" />
            Admin
          </span>
        )}
      </div>

      {/* Card body */}
      <div className="px-5 pb-5 pt-8">
        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate" title={community.name}>
          {community.name || 'Unnamed Community'}
        </h3>

        {community.description && (
          <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {community.description}
          </p>
        )}

        {/* Meta row */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          {/* Type badge */}
          <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-semibold ${typeMeta.color}`}>
            <TypeIcon className="h-3 w-3" />
            {typeMeta.label}
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/5 px-2.5 py-1 font-medium">
            <Users className="h-3.5 w-3.5" />
            {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
          </span>
          {community.code && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/5 px-2.5 py-1 font-mono font-medium tracking-wider">
              <Hash className="h-3.5 w-3.5" />
              {community.code}
            </span>
          )}
        </div>

        {community.admin && (
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
            Admin: <span className="font-semibold text-slate-600 dark:text-slate-300">{community.admin.name}</span>
          </p>
        )}

        {/* Enter button */}
        <button type="button" onClick={() => onEnter(community)}
          className={`relative mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${gradient} py-2.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0`}>
          Enter Community
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}
