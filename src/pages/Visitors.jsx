import { useCallback, useEffect, useState } from 'react';
import { Car, Plus, X, Clock, CheckCircle, XCircle, Calendar, User, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const STATUS_CONFIG = {
  active:    { label: 'Active',    color: '#6E8F73', bg: 'rgba(110,143,115,0.12)' },
  expired:   { label: 'Expired',   color: '#9ca3af', bg: 'rgba(156,163,175,0.12)' },
  cancelled: { label: 'Cancelled', color: '#C97B5A', bg: 'rgba(201,123,90,0.12)' },
};

function PassCard({ pass, onDelete, isAdmin }) {
  const cfg = STATUS_CONFIG[pass.status] || STATUS_CONFIG.active;
  const dateStr = new Date(pass.visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="glass-card p-5 animate-fade-in" style={{ borderLeft: `3px solid ${cfg.color}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', margin: 0 }}>{pass.guestName}</h3>
            <span style={{ background: cfg.bg, color: cfg.color, padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700 }}>
              {cfg.label}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '6px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-70)' }}>
              <Calendar style={{ width: 13, height: 13, flexShrink: 0 }} />
              {dateStr}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-70)' }}>
              <Clock style={{ width: 13, height: 13, flexShrink: 0 }} />
              {pass.visitTime}{pass.visitEndTime ? ` – ${pass.visitEndTime}` : ''}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-70)' }}>
              <Hash style={{ width: 13, height: 13, flexShrink: 0 }} />
              Flat {pass.flatNo}
            </div>
            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-70)' }}>
                <User style={{ width: 13, height: 13, flexShrink: 0 }} />
                {pass.host?.name}
              </div>
            )}
          </div>

          {pass.purpose && (
            <p style={{ marginTop: 8, fontSize: 13, color: 'var(--ink-50)' }}>{pass.purpose}</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          <div style={{ background: 'linear-gradient(135deg,var(--sage),var(--clay))', borderRadius: 10, padding: '6px 14px', textAlign: 'center' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', margin: 0, letterSpacing: '0.06em', fontWeight: 600 }}>PASS CODE</p>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: '0.08em' }}>{pass.passCode}</p>
          </div>
          {pass.status === 'active' && (
            <button
              onClick={() => onDelete(pass._id)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--clay)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 6 }}
            >
              <X style={{ width: 13, height: 13 }} /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CreatePassModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    guestName: '', guestPhone: '', flatNo: user?.flatNo || '',
    visitDate: '', visitTime: '', visitEndTime: '', purpose: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/visitors', form);
      toast.success('Visitor pass created!');
      onCreated(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create pass');
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
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,var(--sage),var(--clay))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🚗</div>
          <div>
            <h2 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: 'var(--ink)' }}>New Visitor Pass</h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-50)' }}>Register your upcoming guest</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Guest Name *', key: 'guestName', type: 'text', placeholder: 'Full name of guest', required: true },
            { label: 'Guest Phone', key: 'guestPhone', type: 'tel', placeholder: 'Optional contact number' },
            { label: 'Your Flat No. *', key: 'flatNo', type: 'text', placeholder: 'e.g. 4B', required: true },
            { label: 'Visit Date *', key: 'visitDate', type: 'date', required: true },
            { label: 'Visit Time *', key: 'visitTime', type: 'time', required: true },
            { label: 'Leave By (optional)', key: 'visitEndTime', type: 'time' },
            { label: 'Purpose', key: 'purpose', type: 'text', placeholder: 'e.g. Birthday party, Delivery' },
          ].map(({ label, key, type, placeholder, required }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => set(key, e.target.value)}
                placeholder={placeholder}
                required={required}
                className="glass-input"
                style={{ width: '100%' }}
              />
            </div>
          ))}

          <button type="submit" disabled={loading}
            style={{ marginTop: 4, padding: '12px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,var(--sage),var(--clay))', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating…' : '✓ Create Visitor Pass'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Visitors() {
  const { user } = useAuth();
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState('all');
  const isAdmin = user?.role === 'admin';

  const fetchPasses = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/visitors');
      setPasses(data);
    } catch {
      toast.error('Failed to load visitor passes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPasses(); }, [fetchPasses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this visitor pass?')) return;
    try {
      await api.delete(`/visitors/${id}`);
      setPasses(p => p.filter(v => v._id !== id));
      toast.success('Pass cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const filtered = tab === 'all' ? passes : passes.filter(p => p.status === tab);

  const tabStyle = (key) => ({
    padding: '7px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13,
    background: tab === key ? 'linear-gradient(135deg,var(--sage),var(--clay))' : 'transparent',
    color: tab === key ? '#fff' : 'var(--ink-70)',
    transition: 'all 0.2s',
  });

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,var(--sage),var(--clay))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🚗</div>
            <div>
              <h1 style={{ margin: 0, fontWeight: 800, fontSize: 22, color: 'var(--ink)' }}>Visitor Passes</h1>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--ink-50)' }}>{isAdmin ? 'All community visitor passes' : 'Register and manage your guests'}</p>
            </div>
          </div>
          <button onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,var(--clay),var(--brick))', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(201,123,90,0.3)' }}>
            <Plus style={{ width: 16, height: 16 }} /> New Pass
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, padding: 4, background: 'var(--parchment-card)', borderRadius: 12, border: '1px solid var(--line)', width: 'fit-content' }}>
          {[['all', 'All'], ['active', 'Active'], ['expired', 'Expired'], ['cancelled', 'Cancelled']].map(([k, l]) => (
            <button key={k} style={tabStyle(k)} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1,2,3].map(i => <div key={i} className="glass-card" style={{ height: 100, opacity: 0.4, animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: '64px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚗</div>
            <p style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 8 }}>No passes found</p>
            <p style={{ color: 'var(--ink-50)', fontSize: 14 }}>Create a visitor pass to get started.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(pass => (
              <PassCard key={pass._id} pass={pass} onDelete={handleDelete} isAdmin={isAdmin} />
            ))}
          </div>
        )}
      </div>

      {showModal && <CreatePassModal onClose={() => setShowModal(false)} onCreated={p => setPasses(prev => [p, ...prev])} />}
    </Layout>
  );
}
