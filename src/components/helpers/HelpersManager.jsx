import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit2, Trash2, Phone, User, Briefcase, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function HelpersManager() {
  const { activeCommunityId } = useAuth();
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHelper, setEditingHelper] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electrician',
    phone: '',
    description: '',
  });

  const fetchHelpers = useCallback(async () => {
    if (!activeCommunityId) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await api.get(`/helpers?communityId=${activeCommunityId}`);
      setHelpers(data);
    } catch (err) {
      toast.error('Failed to load helpers');
    } finally {
      setLoading(false);
    }
  }, [activeCommunityId]);

  useEffect(() => {
    fetchHelpers();
  }, [fetchHelpers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHelper) {
        await api.put(`/helpers/${editingHelper._id}`, formData);
        toast.success('Helper updated successfully');
      } else {
        await api.post('/helpers', { ...formData, communityId: activeCommunityId });
        toast.success('Helper added successfully');
      }
      setShowModal(false);
      setEditingHelper(null);
      setFormData({ name: '', category: '', phone: '', description: '' });
      fetchHelpers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save helper');
    }
  };

  const handleEdit = (helper) => {
    setEditingHelper(helper);
    setFormData({
      name: helper.name,
      category: helper.category,
      phone: helper.phone,
      description: helper.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this helper?')) return;
    try {
      await api.delete(`/helpers/${id}`);
      toast.success('Helper deleted successfully');
      fetchHelpers();
    } catch (err) {
      toast.error('Failed to delete helper');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingHelper(null);
    setFormData({ name: '', category: '', phone: '', description: '' });
  };

  const categories = [...new Set(helpers.map((h) => h.category))];

  return (
    <section className="glass-card p-5">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md" style={{ background: 'linear-gradient(135deg,var(--sage),var(--clay))' }}>
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: 'var(--ink)', fontFamily: '"Space Grotesk", sans-serif' }}>Community Helpers</h3>
            <p className="text-xs" style={{ color: 'var(--ink-50)' }}>Manage local service providers</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,var(--clay),var(--brick))', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
        >
          <Plus className="h-4 w-4" />
          Add Helper
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-center py-8" style={{ color: 'var(--ink-50)' }}>Loading helpers...</p>
      ) : helpers.length === 0 ? (
        <div className="rounded-2xl border-dashed border-2 py-12 text-center" style={{ borderColor: 'var(--line)', background: 'rgba(32,38,31,0.03)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>No helpers added yet.</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--ink-50)' }}>Add local services like plumbers and electricians.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--ink-50)' }}>{category}</h4>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {helpers
                  .filter((h) => h.category === category)
                  .map((helper) => (
                    <div
                      key={helper._id}
                      className="rounded-xl border p-4 transition hover:shadow-md"
                      style={{ background: 'var(--parchment)', borderColor: 'var(--line)' }}
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f1f5f9] text-[#475569]">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(helper)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f8fafc] hover:text-[#0f172a]"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(helper._id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#ef4444] transition hover:bg-[#fef2f2]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="font-bold text-[#0f172a]">{helper.name}</p>
                      {helper.description && (
                        <p className="mt-1 text-xs text-[#64748b]">{helper.description}</p>
                      )}
                      <a
                        href={`tel:${helper.phone}`}
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0ea5e9] hover:text-[#0284c7]"
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

      {/* Modal */}
      {showModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(32,38,31,0.5)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: 440, padding: 28, position: 'relative', boxShadow: '0 24px 48px rgba(32,38,31,0.25)' }}>
            <button onClick={closeModal} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-50)' }}>
              <X style={{ width: 20, height: 20 }} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,var(--sage),var(--clay))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <Briefcase style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: 'var(--ink)' }}>
                  {editingHelper ? 'Edit Helper Contact' : 'Add Society Helper'}
                </h3>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-50)' }}>Register a trusted service provider for your community</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="glass-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Category *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                  {['Electrician', 'Plumber', 'Carpentry', 'Security', 'Housekeeping', 'Milk & Delivery', 'Gardener', 'Other'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      style={{
                        padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--line)',
                        background: formData.category === cat ? 'linear-gradient(135deg,var(--sage),var(--clay))' : 'var(--parchment)',
                        color: formData.category === cat ? '#fff' : 'var(--ink-70)',
                        transition: 'all 0.15s',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {formData.category === 'Other' && (
                  <input type="text" placeholder="Specify category..." onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="glass-input" style={{ width: '100%', marginTop: 4 }} />
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  placeholder="e.g. 9876543210"
                  className="glass-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Notes / Hours (Optional)</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Available 9 AM - 6 PM, Block C"
                  className="glass-input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink-70)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,var(--clay),var(--brick))', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                  {editingHelper ? 'Update Helper' : '✓ Save Helper'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
