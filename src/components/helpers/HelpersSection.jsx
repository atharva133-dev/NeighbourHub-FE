import { useState, useEffect } from 'react';
import { Phone, User, Briefcase, Loader2 } from 'lucide-react';
import api from '../../api/axios';

export default function HelpersSection() {
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHelpers = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/helpers');
        setHelpers(data);
      } catch (err) {
        console.error('Failed to load helpers');
      } finally {
        setLoading(false);
      }
    };
    fetchHelpers();
  }, []);

  const categories = [...new Set(helpers.map((h) => h.category))];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-md shadow-blue-500/20">
          <Briefcase className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Community Helpers</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Local service providers in your area</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : helpers.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No helpers available yet.</p>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">{category}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {helpers
                  .filter((h) => h.category === category)
                  .map((helper) => (
                    <div
                      key={helper._id}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-5 transition hover:border-blue-500/30 dark:hover:border-blue-500/30"
                    >
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                        <User className="h-6 w-6" />
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white text-lg">{helper.name}</p>
                      {helper.description && (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{helper.description}</p>
                      )}
                      <a
                        href={`tel:${helper.phone}`}
                        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        {helper.phone}
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
