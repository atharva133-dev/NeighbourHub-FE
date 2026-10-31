import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Phone, User, Briefcase, Loader2, Plus, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const HELPER_CATEGORIES = ['Electrician', 'Plumber', 'Carpentry', 'Security', 'Housekeeping', 'Milk & Delivery', 'Gardener', 'Other'];

function AddHelperModal({ onClose, onCreated, communityId }) {
  const [form, setForm] = useState({ name: '', category: 'Electrician', phone: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/helpers', { ...form, communityId });
      toast.success('Helper contact added!');
      onCreated(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add helper');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(32,38,31,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: 440, padding: 28, position: 'relative', boxShadow: '0 24px 48px rgba(32,38,31,0.25)' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-50)' }}>
          <X style={{ width: 20, height: 20 }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,var(--sage),var(--clay))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Briefcase style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: 'var(--ink)' }}>Add Society Helper</h3>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-50)' }}>Register a trusted service provider for your community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Full Name *</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Ramesh Kumar" required className="glass-input" style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Category *</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
              {HELPER_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category: cat }))}
                  style={{
                    padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--line)',
                    background: form.category === cat ? 'linear-gradient(135deg,var(--sage),var(--clay))' : 'var(--parchment)',
                    color: form.category === cat ? '#fff' : 'var(--ink-70)',
                    transition: 'all 0.15s',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
            {form.category === 'Other' && (
              <input type="text" placeholder="Specify category..." onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="glass-input" style={{ width: '100%', marginTop: 4 }} />
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Phone Number *</label>
            <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="e.g. 9876543210" required className="glass-input" style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Notes / Hours (Optional)</label>
            <input type="text" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Available 9 AM - 6 PM, Block C" className="glass-input" style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink-70)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,var(--clay),var(--brick))', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving…' : '✓ Save Helper'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default function HelpersSection() {
  const { user, activeCommunityId } = useAuth();
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchHelpers = useCallback(async () => {
    if (!activeCommunityId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/helpers?communityId=${activeCommunityId}`);
      setHelpers(data);
    } catch {
      console.error('Failed to load helpers');
    } finally {
      setLoading(false);
    }
  }, [activeCommunityId]);

  useEffect(() => { fetchHelpers(); }, [fetchHelpers]);

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this helper contact?')) return;
    try {
      await api.delete(`/helpers/${id}`);
      setHelpers(prev => prev.filter(h => h._id !== id));
      toast.success('Helper removed');
    } catch {
      toast.error('Failed to remove helper');
    }
  };

  const categories = [...new Set(helpers.map((h) => h.category))];

  return (
    <div className="glass-card rounded-2xl p-6" style={{ background: 'var(--parchment-card)', border: '1px solid var(--line)' }}>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md" style={{ background: 'linear-gradient(135deg,var(--sage),var(--clay))' }}>
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--ink)' }}>Community Helpers</h2>
            <p className="text-sm" style={{ color: 'var(--ink-50)' }}>Local service providers for your society</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,var(--clay),var(--brick))', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus style={{ width: 14, height: 14 }} /> Add Helper
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : helpers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--ink-50)' }}>
          <p style={{ fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>No helpers added for this community yet</p>
          <p style={{ fontSize: 12, margin: 0 }}>Click <strong>+ Add Helper</strong> to list your electrician, plumber, or security contacts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="mb-4 text-base font-bold" style={{ color: 'var(--ink)' }}>{category}</h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {helpers
                  .filter((h) => h.category === category)
                  .map((helper) => (
                    <div
                      key={helper._id}
                      className="rounded-xl border p-4 transition-all"
                      style={{ background: 'var(--parchment)', borderColor: 'var(--line)', position: 'relative' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ background: 'linear-gradient(135deg,var(--sage),var(--clay))' }}>
                          <User className="h-5 w-5" />
                        </div>
                        {user?.role === 'admin' && (
                          <button onClick={() => handleDelete(helper._id)} style={{ color: 'var(--clay)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
                        )}
                      </div>

                      <p className="font-bold text-base" style={{ color: 'var(--ink)' }}>{helper.name}</p>
                      {helper.description && (
                        <p className="mt-1 text-xs" style={{ color: 'var(--ink-70)' }}>{helper.description}</p>
                      )}
                      <a
                        href={`tel:${helper.phone}`}
                        className="mt-3 inline-flex items-center gap-2 text-xs font-bold"
                        style={{ color: 'var(--clay)' }}
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {helper.phone}
                      </a>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <AddHelperModal
          onClose={() => setShowModal(false)}
          onCreated={(newH) => setHelpers((prev) => [...prev, newH])}
          communityId={activeCommunityId}
        />
      )}
    </div>
  );
}
