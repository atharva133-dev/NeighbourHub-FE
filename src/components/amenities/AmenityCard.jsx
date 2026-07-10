import { Users, Info, CalendarPlus, Clock } from 'lucide-react';

export default function AmenityCard({ amenity, onBook }) {
  return (
    <div className="glass-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:hover:border-purple-500/30 hover:border-purple-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{amenity.name}</h3>
          {amenity.description && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
              {amenity.description}
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            {amenity.capacity != null && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                <Users className="h-3.5 w-3.5" />
                Capacity: {amenity.capacity}
              </span>
            )}
            {(amenity.operatingHours || (amenity.operatingDays && amenity.operatingDays.length > 0)) && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 px-2.5 py-1 text-xs font-medium ring-1 ring-purple-200 dark:ring-purple-500/20">
                <Clock className="h-3.5 w-3.5" />
                {amenity.operatingHours || 'Available'}
                {amenity.operatingDays && amenity.operatingDays.length > 0 && ` (${amenity.operatingDays.length === 7 ? 'Everyday' : amenity.operatingDays.join(', ')})`}
              </span>
            )}
            <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ${
              amenity.isBookable
                ? 'bg-green-100 text-green-700 ring-green-200 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-400/20'
                : 'bg-slate-100 text-slate-500 ring-slate-200 dark:bg-white/5 dark:text-slate-400 dark:ring-white/10'
            }`}>
              <Info className="h-3 w-3" />
              {amenity.isBookable ? 'Bookable' : 'View only'}
            </span>
          </div>
        </div>

        {amenity.isBookable && (
          <button
            type="button"
            onClick={() => onBook(amenity)}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:shadow-purple-500/40"
          >
            <CalendarPlus className="h-4 w-4" />
            Book
          </button>
        )}
      </div>
    </div>
  );
}
