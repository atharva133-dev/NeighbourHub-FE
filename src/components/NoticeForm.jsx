import { useState, useRef } from 'react';
import { Megaphone, Send, Image, X, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['General', 'Event', 'Lost & Found', 'Emergency'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export default function NoticeForm({ onCreated, defaultCategory }) {
  const { activeCommunityId } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(defaultCategory || 'General');
  const [priority, setPriority] = useState(defaultCategory === 'Emergency' ? 'Urgent' : 'Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeCommunityId) {
      toast.error('Please select a community first');
      navigate('/community');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('category', category);
      formData.append('priority', priority);
      formData.append('communityId', activeCommunityId);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const { data } = await api.post('/notices', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setTitle('');
      setContent('');
      setCategory('General');
      setPriority('Medium');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-200">
            Media (Optional)
          </label>
          <div
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all ${
              dragActive
                ? 'border-blue-400/50 bg-blue-500/5'
                : 'border-white/10 hover:border-white/20'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-48 w-full rounded-xl object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-2 rounded-lg bg-black/50 px-2 py-1 text-xs text-white">
                  {imageFile?.name} ({(imageFile?.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                  <Image className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-200">Click to upload or drag and drop</p>
                <p className="mt-1 text-xs text-slate-400">PNG, JPG, GIF up to 5MB (Optional)</p>
              </div>
            )}
          </div>
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
