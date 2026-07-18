import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Phone, User, Briefcase, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function HelpersManager() {
  const [helpers, setHelpers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingHelper, setEditingHelper] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    phone: '',
    description: '',
  });

  const fetchHelpers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/helpers');
      setHelpers(data);
    } catch (err) {
      toast.error('Failed to load helpers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHelpers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingHelper) {
        await api.put(`/helpers/${editingHelper._id}`, formData);
        toast.success('Helper updated successfully');
      } else {
        await api.post('/helpers', formData);
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
    <section className="rounded-[20px] border border-[#e2e8f0] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f172a] shadow-sm">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0f172a]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Community Helpers</h3>
            <p className="text-xs text-[#64748b]">Manage local service providers</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[#0f172a] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1e293b]"
        >
          <Plus className="h-4 w-4" />
          Add Helper
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#64748b] text-center py-8">Loading helpers...</p>
      ) : helpers.length === 0 ? (
        <div className="rounded-[20px] border-dashed border-2 border-[#e2e8f0] bg-[#f8fafc] py-12 text-center">
          <p className="text-sm font-semibold text-[#0f172a]">No helpers added yet.</p>
          <p className="mt-1 text-xs text-[#64748b]">Add local services like plumbers and electricians.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h4 className="mb-3 text-xs font-bold uppercase tracking-widest text-[#64748b]">{category}</h4>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {helpers
                  .filter((h) => h.category === category)
                  .map((helper) => (
                    <div
                      key={helper._id}
                      className="rounded-[16px] border border-[#e2e8f0] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition hover:shadow-md hover:border-[#cbd5e1]"
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
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-[#f1f5f9] pb-4">
              <h3 className="text-lg font-bold text-[#0f172a]" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
                {editingHelper ? 'Edit Helper' : 'Add Helper'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] transition hover:bg-[#f1f5f9] hover:text-[#0f172a]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-bold text-[#334155]">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm font-medium text-[#0f172a] outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
                  placeholder="Helper name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-[#334155]">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm font-medium text-[#0f172a] outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
                  placeholder="e.g., Electrician, Plumber"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-[#334155]">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm font-medium text-[#0f172a] outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-bold text-[#334155]">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[#cbd5e1] bg-white px-4 py-2.5 text-sm font-medium text-[#0f172a] outline-none focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a]"
                  placeholder="Additional details..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm font-bold text-[#475569] transition hover:bg-[#f8fafc]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#0f172a] px-4 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#1e293b]"
                >
                  {editingHelper ? 'Update' : 'Add Helper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
