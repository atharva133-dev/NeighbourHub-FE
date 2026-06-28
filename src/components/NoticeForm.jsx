import { useState } from 'react';
import { Megaphone, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const CATEGORIES = ['General', 'Event', 'Lost & Found', 'Emergency'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export default function NoticeForm({ onCreated, defaultCategory }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(defaultCategory || 'General');
  const [priority, setPriority] = useState(defaultCategory === 'Emergency' ? 'Urgent' : 'Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/notices', { title, content, category, priority });
      setTitle('');
      setContent('');
      setCategory('General');
      setPriority('Medium');
      onCreated?.(data);
      toast.success(category === 'Emergency' ? 'Emergency notice posted' : 'Notice posted');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to post notice';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-5 relative z-0">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 text-white">
          <Megaphone className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-white">Post a Notice</h2>
          <p className="text-xs text-slate-400">Share updates with your neighbours.</p>
        </div>
      </div>
      {error && (
        <div className="mb-4 rounded-lg border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-200">{error}</div>
      )}
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-200">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="What's happening?"
            className="glass-input w-full"
          />
        </div>
        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-200">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="glass-input w-full"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="priority" className="mb-1 block text-sm font-medium text-slate-200">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="glass-input w-full"
          >
            {PRIORITIES.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="content" className="mb-1 block text-sm font-medium text-slate-200">
            Details
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={4}
            placeholder="Share the details with your neighbours..."
            className="glass-input w-full resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-blue-500/30 disabled:opacity-60"
        >
          <Send className="h-4 w-4" />
          {loading ? 'Posting...' : 'Post Notice'}
        </button>
      </div>
    </form>
  );
}
