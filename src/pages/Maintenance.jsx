import { useCallback, useEffect, useState } from 'react';
import { Wrench, Plus, X, Clock, CheckCircle2, AlertTriangle, AlertCircle, User, Hash, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Layout from '../components/Layout';

const STATUS_CONFIG = {
  Open: { label: 'Open', color: '#C97B5A', bg: 'rgba(201,123,90,0.12)', icon: Clock },
  'In Progress': { label: 'In Progress', color: '#6E8F73', bg: 'rgba(110,143,115,0.12)', icon: Wrench },
  Resolved: { label: 'Resolved', color: '#2e7d32', bg: 'rgba(46,125,50,0.12)', icon: CheckCircle2 },
  Rejected: { label: 'Rejected', color: '#d32f2f', bg: 'rgba(211,47,47,0.12)', icon: AlertCircle },
};

const PRIORITY_COLOR = {
  High: '#d32f2f',
  Medium: '#C97B5A',
  Low: '#6E8F73',
};

function RequestCard({ req, onStatusUpdate, onDelete, isAdmin }) {
  const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.Open;
  const StatusIcon = cfg.icon;
  const dateStr = new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  const [updating, setUpdating] = useState(false);
  const [adminNoteInput, setAdminNoteInput] = useState(req.adminNote || '');
  const [showAdminEdit, setShowAdminEdit] = useState(false);

  const handleUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const { data } = await api.patch(`/maintenance/${req._id}/status`, {
        status: newStatus,
        adminNote: adminNoteInput,
      });
      toast.success(`Request marked as ${newStatus}`);
      onStatusUpdate(data);
      setShowAdminEdit(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="glass-card p-5 animate-fade-in" style={{ borderLeft: `3px solid ${cfg.color}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', margin: 0 }}>{req.title}</h3>
            <span style={{ background: cfg.bg, color: cfg.color, padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <StatusIcon style={{ width: 12, height: 12 }} />
              {cfg.label}
            </span>
            <span style={{ background: 'var(--parchment-card)', border: '1px solid var(--line)', color: 'var(--ink-70)', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
              {req.category}
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: PRIORITY_COLOR[req.priority] || PRIORITY_COLOR.Medium }}>
              ● {req.priority} Priority
            </span>
          </div>

          <p style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--ink-70)', lineHeight: 1.5 }}>
            {req.description}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--ink-50)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Hash style={{ width: 12, height: 12 }} /> Flat {req.flatNo}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><User style={{ width: 12, height: 12 }} /> {req.raisedBy?.name || 'Resident'}</span>
            <span>{dateStr}</span>
          </div>

          {req.adminNote && (
            <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(32,38,31,0.04)', border: '1px solid var(--line)', fontSize: 13, color: 'var(--ink-70)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <MessageSquare style={{ width: 14, height: 14, marginTop: 2, flexShrink: 0, color: 'var(--sage)' }} />
              <div>
                <strong style={{ color: 'var(--ink)', fontSize: 12 }}>Admin Note:</strong> {req.adminNote}
              </div>
            </div>
          )}

          {isAdmin && showAdminEdit && (
            <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: 'var(--parchment)', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>Update Status & Add Note</label>
              <input
                type="text"
                value={adminNoteInput}
                onChange={e => setAdminNoteInput(e.target.value)}
                placeholder="Add note for resident (optional)..."
                className="glass-input"
                style={{ fontSize: 13, width: '100%' }}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['In Progress', 'Resolved', 'Rejected'].map(statusOption => (
                  <button
                    key={statusOption}
                    disabled={updating}
                    onClick={() => handleUpdate(statusOption)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: STATUS_CONFIG[statusOption].color, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Set {statusOption}
                  </button>
                ))}
                <button onClick={() => setShowAdminEdit(false)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink-70)', fontSize: 12, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          {isAdmin && !showAdminEdit && (
            <button
              onClick={() => setShowAdminEdit(true)}
              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--parchment-card)', color: 'var(--ink)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              Update Status
            </button>
          )}
          <button
            onClick={() => onDelete(req._id)}
            style={{ fontSize: 12, color: 'var(--clay)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateRequestModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', category: 'Plumbing', priority: 'Medium', flatNo: user?.flatNo || '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/maintenance', form);
      toast.success('Maintenance request submitted!');
      onCreated(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(32,38,31,0.4)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', padding: 28, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-50)' }}>
          <X style={{ width: 20, height: 20 }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,var(--sage),var(--clay))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🔧</div>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: 'var(--ink)' }}>New Maintenance Request</h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-50)' }}>Report an issue in your flat or common area</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Title *</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Water leak in kitchen sink" required className="glass-input" style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="glass-input" style={{ width: '100%' }}>
                {['Plumbing', 'Electrical', 'Carpentry', 'Cleaning', 'Lift', 'Security', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className="glass-input" style={{ width: '100%' }}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Flat No. *</label>
            <input type="text" value={form.flatNo} onChange={e => set('flatNo', e.target.value)} placeholder="e.g. 4B" required className="glass-input" style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Description *</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the problem in detail..." required rows={3} className="glass-input" style={{ width: '100%', resize: 'vertical' }} />
          </div>

          <button type="submit" disabled={loading} style={{ marginTop: 4, padding: '12px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,var(--sage),var(--clay))', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Submitting…' : '✓ Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Maintenance() {
  const { user, activeCommunityId } = useAuth();
  const { socket, joinCommunity, leaveCommunity } = useSocket();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState('all');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!socket || !activeCommunityId) return;
    joinCommunity(activeCommunityId);
    return () => leaveCommunity(activeCommunityId);
  }, [socket, activeCommunityId, joinCommunity, leaveCommunity]);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/maintenance');
      setRequests(data);
    } catch {
      toast.error('Failed to load maintenance requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  useEffect(() => {
    if (!socket) return;
    const handleCreated = (item) => setRequests(prev => [item, ...prev.filter(r => r._id !== item._id)]);
    const handleUpdated = (item) => setRequests(prev => prev.map(r => r._id === item._id ? item : r));
    socket.on('maintenance:created', handleCreated);
    socket.on('maintenance:updated', handleUpdated);
    return () => {
      socket.off('maintenance:created', handleCreated);
      socket.off('maintenance:updated', handleUpdated);
    };
  }, [socket]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this maintenance request?')) return;
    try {
      await api.delete(`/maintenance/${id}`);
      setRequests(r => r.filter(item => item._id !== id));
      toast.success('Request deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const filtered = tab === 'all' ? requests : requests.filter(r => r.status === tab);

  const tabStyle = (key) => ({
    padding: '7px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
    background: tab === key ? 'linear-gradient(135deg,var(--sage),var(--clay))' : 'transparent',
    color: tab === key ? '#fff' : 'var(--ink-70)',
    transition: 'all 0.2s',
  });

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,var(--sage),var(--clay))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🔧</div>
            <div>
              <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: 'var(--ink)' }}>Maintenance Requests</h1>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-50)' }}>{isAdmin ? 'Manage all society maintenance issues' : 'Track and raise repair requests'}</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,var(--clay),var(--brick))', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(201,123,90,0.3)' }}>
            <Plus style={{ width: 16, height: 16 }} /> Raise Request
          </button>
        </div>

        <div style={{ display: 'flex', gap: 4, marginBottom: 20, padding: 4, background: 'var(--parchment-card)', borderRadius: 12, border: '1px solid var(--line)', width: 'fit-content', flexWrap: 'wrap' }}>
          {[['all', 'All'], ['Open', 'Open'], ['In Progress', 'In Progress'], ['Resolved', 'Resolved'], ['Rejected', 'Rejected']].map(([k, l]) => (
            <button key={k} style={tabStyle(k)} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1,2,3].map(i => <div key={i} className="glass-card" style={{ height: 100, opacity: 0.4, animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: '64px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
            <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 8 }}>No maintenance requests</p>
            <p style={{ color: 'var(--ink-50)', fontSize: 14 }}>Everything is running smoothly!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(req => (
              <RequestCard
                key={req._id}
                req={req}
                onStatusUpdate={updated => setRequests(prev => prev.map(r => r._id === updated._id ? updated : r))}
                onDelete={handleDelete}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && <CreateRequestModal onClose={() => setShowModal(false)} onCreated={r => setRequests(prev => [r, ...prev])} />}
    </Layout>
  );
}
