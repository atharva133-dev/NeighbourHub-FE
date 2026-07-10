import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import ToggleSwitch from '../settings/ToggleSwitch';

export default function AddAmenityForm({ communityId, onAdded }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isBookable, setIsBookable] = useState(true);
  const [capacity, setCapacity] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [operatingDays, setOperatingDays] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Amenity name is required'); return; }

    setLoading(true);
    try {
      const { data } = await api.post(`/community/${communityId}/amenities`, {
        name: name.trim(),
        description: description.trim(),
        isBookable,
        capacity: capacity ? Number(capacity) : undefined,
        operatingHours: operatingHours.trim(),
        operatingDays,
      });
      toast.success(`"${data.name}" added`);
      onAdded?.(data);
      setName(''); setDescription(''); setIsBookable(true); setCapacity('');
      setOperatingHours(''); setOperatingDays([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add amenity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Clubhouse, Gym, Parking"
            required
            className="glass-input w-full"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Capacity (optional)
          </label>
          <input
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="Max people"
            className="glass-input w-full"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Operating Hours (optional)
          </label>
          <input
            type="text"
            value={operatingHours}
            onChange={(e) => setOperatingHours(e.target.value)}
            placeholder="e.g. 9am - 9pm"
            className="glass-input w-full"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
            Operating Days (optional)
          </label>
          <div className="flex items-center gap-1 flex-wrap mt-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <button
                key={day}
                type="button"
                onClick={() => {
                  if (operatingDays.includes(day)) {
                    setOperatingDays(operatingDays.filter(d => d !== day));
                  } else {
                    setOperatingDays([...operatingDays, day]);
                  }
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${operatingDays.includes(day) ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10'}`}
              >
                {day[0]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setOperatingDays(operatingDays.length === 7 ? [] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])}
              className="ml-2 rounded-lg text-xs font-semibold px-2 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            >
              Everyday
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
          Description (optional)
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Brief description of this amenity…"
          className="glass-input w-full resize-none"
        />
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Allow bookings</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Members can book this amenity</p>
        </div>
        <ToggleSwitch checked={isBookable} onChange={setIsBookable} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition-all hover:-translate-y-0.5 hover:shadow-purple-500/40 disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Adding…</> : <><Plus className="h-4 w-4" />Add Amenity</>}
      </button>
    </form>
  );
}
