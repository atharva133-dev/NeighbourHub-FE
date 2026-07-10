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
    <section className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 shadow-md shadow-blue-500/20">
            <Briefcase className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Community Helpers</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage local service providers</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-blue-500/30"
        >
          <Plus className="h-4 w-4" />
          Add Helper
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading helpers...</p>
      ) : helpers.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No helpers added yet.</p>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category}>
              <h4 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">{category}</h4>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {helpers
                  .filter((h) => h.category === category)
                  .map((helper) => (
                    <div
                      key={helper._id}
                      className="rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-4"
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(helper)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 transition hover:bg-blue-500/20"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(helper._id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 transition hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">{helper.name}</p>
                      {helper.description && (
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{helper.description}</p>
                      )}
                      <a
                        href={`tel:${helper.phone}`}
                        className="mt-3 inline-flex items-center gap-2 text-sm text-blue-500 hover:text-blue-400"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0f0f1a]/95 backdrop-blur-xl p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {editingHelper ? 'Edit Helper' : 'Add Helper'}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="glass-input w-full"
                  placeholder="Helper name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="glass-input w-full"
                  placeholder="e.g., Electrician, Plumber"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="glass-input w-full"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-200">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="glass-input w-full resize-none"
                  placeholder="Additional details..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 transition hover:shadow-blue-500/30"
                >
                  {editingHelper ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
