import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function JoinCommunityModal({ open, onClose, onJoined }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleClose = () => {
    setCode('');
    setError('');
    onClose();
  };

  const handleCodeChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/community/join', { code });
      toast.success(`Joined ${data.name}!`);
      handleClose();
      onJoined?.(data);
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to join community';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} aria-label="Close" />

      <div className="modal-content glass-card relative z-10 w-full max-w-sm rounded-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Join Community</h2>
          <button type="button" onClick={handleClose} className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-400">
          Enter the 6-digit code shared by a community admin
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              inputMode="numeric"
              value={code}
              onChange={handleCodeChange}
              placeholder="000000"
              maxLength={6}
              className="glass-input w-full text-center font-mono text-2xl tracking-[0.5em] text-white"
              autoFocus
            />
            {error && <p className="mt-2 text-center text-sm text-red-400">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Community'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
