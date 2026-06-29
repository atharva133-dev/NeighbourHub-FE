import { Users, Shield, ArrowRight } from 'lucide-react';

export default function CommunityCard({ community, onEnter }) {
  const initials = community.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="community-card group glass-card relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1">
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 community-card-glow" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 text-lg font-bold text-white shadow-lg">
          {community.avatar ? (
            <img src={community.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-bold text-gray-900 dark:text-white truncate" title={community.name}>{community.name || "Unnamed Community"}</p>
            {community.isAdmin && (
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-300">
                <Shield className="h-3 w-3" />
                Admin
              </span>
            )}
          </div>

          {community.description && (
            <p className="mt-1 line-clamp-2 text-sm text-slate-400">{community.description}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
            </span>
            {community.admin && (
              <span>
                Admin: <span className="text-slate-300">{community.admin.name}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onEnter(community)}
        className="relative mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition duration-200 hover:shadow-purple-500/40"
      >
        Enter Community
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
