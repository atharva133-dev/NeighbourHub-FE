import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  CreditCard, CheckCircle, Clock, AlertTriangle, Download,
  QrCode, Upload, X, ChevronDown, ChevronRight, Shield,
  IndianRupee, History, Loader2, Check, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const STATUS_CONFIG = {
  pending:              { label: 'Payment Pending',         color: '#C97B5A', bg: 'rgba(201,123,90,0.1)',  icon: Clock },
  under_verification:   { label: 'Under Verification',      color: '#6E8F73', bg: 'rgba(110,143,115,0.1)', icon: RefreshCw },
  paid:                 { label: 'Paid',                    color: '#4E6B54', bg: 'rgba(78,107,84,0.12)',  icon: CheckCircle },
  overdue:              { label: 'Overdue',                  color: '#A8442F', bg: 'rgba(168,68,47,0.1)',   icon: AlertTriangle },
};

function formatMonth(m) {
  if (!m) return '';
  const [y, mo] = m.split('-');
  return new Date(y, parseInt(mo) - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

// ── UPI QR Modal ──────────────────────────────────────────────────────────────
function UpiModal({ payment, onClose, onSubmit }) {
  const [utr, setUtr] = useState('');
  const [mode, setMode] = useState('upi');
  const [loading, setLoading] = useState(false);

  const upiId  = 'society@upi';        // society UPI ID
  const amount = payment?.amount || 0;
  const upiLink = `upi://pay?pa=${upiId}&pn=NeighbourHub+Society&am=${amount}&cu=INR&tn=Maintenance+${payment?.month}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (utr.trim().length < 8) { toast.error('Enter a valid UTR/Ref number (min 8 digits)'); return; }
    setLoading(true);
    try {
      await onSubmit(utr.trim(), mode);
      onClose();
    } finally { setLoading(false); }
  };

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(32,38,31,0.55)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: 460, padding: 28, position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-50)' }}>
          <X style={{ width: 20, height: 20 }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,var(--sage),var(--clay))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <QrCode style={{ width: 20, height: 20 }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: 18, color: 'var(--ink)' }}>Pay Maintenance Dues</h3>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-50)' }}>Scan QR or use UPI link to pay ₹{amount.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* QR Code placeholder */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 20, border: '1px solid var(--line)' }}>
          <div style={{ width: 160, height: 160, background: 'linear-gradient(135deg,#f0f0f0,#e0e0e0)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#888', textAlign: 'center', padding: 8 }}>
            <div>
              <QrCode size={64} style={{ color: '#333', marginBottom: 6 }} />
              <p style={{ margin: 0 }}>Scan with any UPI app</p>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#333' }}>UPI ID: <span style={{ color: '#6E8F73' }}>{upiId}</span></p>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#20261F' }}>₹{amount.toLocaleString('en-IN')}</p>
          <a href={upiLink} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 10, background: 'linear-gradient(135deg,#6E8F73,#4E6B54)', color: '#fff', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
            Open UPI App
          </a>
        </div>

        {/* UTR Submission Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>Payment Mode</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['upi', 'UPI / QR'], ['neft', 'NEFT/IMPS']].map(([val, label]) => (
                <button key={val} type="button" onClick={() => setMode(val)}
                  style={{ flex: 1, padding: '8px', borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: '1px solid var(--line)', background: mode === val ? 'linear-gradient(135deg,var(--sage),var(--clay))' : 'var(--parchment)', color: mode === val ? '#fff' : 'var(--ink-70)', transition: 'all 0.15s' }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--ink-70)', marginBottom: 6 }}>UTR / Transaction Reference Number *</label>
            <input type="text" value={utr} onChange={e => setUtr(e.target.value)} placeholder="e.g. 423819054321" required className="glass-input" style={{ width: '100%' }} maxLength={22} />
            <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--ink-50)' }}>Found in your UPI app under payment history / transaction details</p>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink-70)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,var(--sage),var(--clay))', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Submitting…' : '✓ Submit for Verification'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

// ── Receipt Modal ─────────────────────────────────────────────────────────────
function ReceiptModal({ payment, onClose }) {
  if (!payment) return null;

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(32,38,31,0.55)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: 420, padding: 0, position: 'relative', overflow: 'hidden' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.7)', border: 'none', cursor: 'pointer', color: '#333', borderRadius: 8, padding: 4, zIndex: 2 }}>
          <X style={{ width: 16, height: 16 }} />
        </button>

        {/* Receipt Header */}
        <div style={{ background: 'linear-gradient(135deg,var(--sage),var(--clay))', padding: '24px 24px 20px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <CheckCircle size={24} />
            <span style={{ fontWeight: 800, fontSize: 18 }}>Payment Receipt</span>
          </div>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.85 }}>NeighbourHub Society Management</p>
        </div>

        {/* Receipt Body */}
        <div style={{ padding: 24 }}>
          <div style={{ background: 'rgba(110,143,115,0.08)', border: '1px solid rgba(110,143,115,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: 'var(--ink-70)', fontWeight: 600 }}>Receipt No.</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)', fontFamily: 'monospace' }}>{payment.receiptNo}</span>
          </div>

          {[
            ['Flat No.', payment.flatNo],
            ['Month', formatMonth(payment.month)],
            ['Amount Paid', `₹${payment.amount?.toLocaleString('en-IN')}`],
            ['Payment Mode', payment.paymentMode?.toUpperCase() || '—'],
            ['UTR / Ref No.', payment.utrNumber || '—'],
            ['Paid On', payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
          ].map(([key, val]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ fontSize: 12, color: 'var(--ink-50)', fontWeight: 600 }}>{key}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', textAlign: 'right', maxWidth: 200 }}>{val}</span>
            </div>
          ))}

          <div style={{ marginTop: 16, padding: '10px', background: 'rgba(78,107,84,0.08)', borderRadius: 8, textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: 11, color: '#4E6B54', fontWeight: 600 }}>✓ Payment Verified & Approved by Society Treasurer</p>
          </div>

          <button onClick={onClose} style={{ marginTop: 16, width: '100%', padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,var(--sage),var(--clay))', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Main Payments Page ────────────────────────────────────────────────────────
export default function Payments() {
  const { user, activeCommunityId } = useAuth();
  const [payment, setPayment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [activeTab, setActiveTab] = useState('dues'); // 'dues' | 'history'

  // Admin state
  const [adminPayments, setAdminPayments] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);

  const isAdmin = user?.role === 'admin';

  const fetchDues = useCallback(async () => {
    if (!activeCommunityId) return;
    setLoading(true);
    try {
      const { data } = await api.get('/payments/my-dues');
      setPayment(data);
    } catch (err) {
      toast.error('Failed to load dues');
    } finally { setLoading(false); }
  }, [activeCommunityId]);

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await api.get('/payments/history');
      setHistory(data);
    } catch {}
  }, []);

  const fetchAdminPayments = useCallback(async () => {
    if (!isAdmin) return;
    setAdminLoading(true);
    try {
      const { data } = await api.get('/payments/admin/all');
      setAdminPayments(data);
    } catch { toast.error('Failed to load payment records'); }
    finally { setAdminLoading(false); }
  }, [isAdmin]);

  useEffect(() => { fetchDues(); fetchHistory(); }, [fetchDues, fetchHistory]);
  useEffect(() => { if (activeTab === 'admin') fetchAdminPayments(); }, [activeTab, fetchAdminPayments]);

  const handleSubmitUTR = async (utr, mode) => {
    const { data } = await api.post(`/payments/${payment._id}/submit-utr`, { utrNumber: utr, paymentMode: mode });
    toast.success('Submitted for verification! Treasurer will approve shortly.');
    setPayment(data);
  };

  const handleVerify = async (id, action) => {
    setVerifyingId(id);
    try {
      await api.post(`/payments/${id}/verify`, { action });
      toast.success(action === 'approve' ? 'Payment approved & receipt issued!' : 'Payment rejected.');
      fetchAdminPayments();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to verify'); }
    finally { setVerifyingId(null); }
  };

  const handleRecordOffline = async (id, mode) => {
    setVerifyingId(id);
    try {
      await api.post(`/payments/${id}/record-offline`, { paymentMode: mode });
      toast.success(`Cash/Cheque payment recorded!`);
      fetchAdminPayments();
    } catch (err) { toast.error('Failed to record'); }
    finally { setVerifyingId(null); }
  };

  const cfg = payment ? STATUS_CONFIG[payment.status] : STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;

  return (
    <Layout>
      <div className="app-content">
        {/* Page Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: 'var(--ink)' }}>Payments & Dues</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--ink-50)' }}>Monthly maintenance billing & payment history</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[['dues', 'My Dues'], ['history', 'History'], ...(isAdmin ? [['admin', 'Treasurer Panel']] : [])].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)}
              style={{ padding: '8px 20px', borderRadius: 10, border: '1px solid var(--line)', fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', background: activeTab === key ? 'linear-gradient(135deg,var(--sage),var(--clay))' : 'var(--parchment-card)', color: activeTab === key ? '#fff' : 'var(--ink-70)' }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── My Dues Tab ── */}
        {activeTab === 'dues' && (
          <div style={{ maxWidth: 560 }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                <Loader2 className="animate-spin h-7 w-7" style={{ color: 'var(--ink-50)' }} />
              </div>
            ) : payment ? (
              <>
                {/* Status Card */}
                <div className="rounded-2xl border p-6 mb-5" style={{ background: cfg.bg, borderColor: cfg.color + '33' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <StatusIcon size={22} />
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: cfg.color, textTransform: 'uppercase', letterSpacing: 1 }}>{cfg.label}</p>
                        <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: 'var(--ink)' }}>₹{payment.amount?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{formatMonth(payment.month)}</p>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-50)' }}>Due: {payment.dueDate ? new Date(payment.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Breakdown Card */}
                <div className="glass-card p-5 mb-5">
                  <h3 style={{ margin: '0 0 14px', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>Bill Breakdown</h3>
                  {payment.breakdown?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < payment.breakdown.length - 1 ? '1px solid var(--line)' : 'none' }}>
                      <span style={{ fontSize: 13, color: 'var(--ink-70)' }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>₹{item.amount?.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', borderTop: '2px solid var(--line)', marginTop: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--ink)' }}>Total Due</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--clay)' }}>₹{payment.amount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* UTR Notice (if under verification) */}
                {payment.status === 'under_verification' && (
                  <div style={{ background: 'rgba(110,143,115,0.1)', border: '1px solid rgba(110,143,115,0.3)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#4E6B54' }}>⏳ Payment submitted! UTR: <span style={{ fontFamily: 'monospace' }}>{payment.utrNumber}</span></p>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6E8F73' }}>Treasurer is verifying your payment. Receipt will be issued upon approval.</p>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {(payment.status === 'pending' || payment.status === 'overdue') && (
                    <button onClick={() => setShowUpiModal(true)}
                      style={{ flex: 1, minWidth: 160, padding: '12px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,var(--sage),var(--clay))', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <QrCode size={18} /> Pay via UPI
                    </button>
                  )}
                  {payment.status === 'paid' && (
                    <button onClick={() => setShowReceipt(true)}
                      style={{ flex: 1, minWidth: 160, padding: '12px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg,var(--sage),var(--clay))', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <Download size={18} /> View Receipt
                    </button>
                  )}
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ── History Tab ── */}
        {activeTab === 'history' && (
          <div style={{ maxWidth: 560 }}>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-50)' }}>
                <History size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                <p style={{ fontWeight: 700, fontSize: 15 }}>No payment history yet</p>
              </div>
            ) : history.map(p => {
              const c = STATUS_CONFIG[p.status];
              const SI = c.icon;
              return (
                <div key={p._id} className="glass-card p-4 mb-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <SI size={18} style={{ color: c.color }} />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{formatMonth(p.month)}</p>
                      <p style={{ margin: 0, fontSize: 12, color: c.color, fontWeight: 600 }}>{c.label}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>₹{p.amount?.toLocaleString('en-IN')}</p>
                    {p.receiptNo && <p style={{ margin: 0, fontSize: 11, color: 'var(--ink-50)', fontFamily: 'monospace' }}>{p.receiptNo}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Admin Treasurer Panel ── */}
        {activeTab === 'admin' && isAdmin && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>All Payments — Current Month</h3>
              <button onClick={fetchAdminPayments} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--parchment)', color: 'var(--ink-70)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                ↻ Refresh
              </button>
            </div>

            {adminLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
                <Loader2 className="animate-spin h-6 w-6" style={{ color: 'var(--ink-50)' }} />
              </div>
            ) : adminPayments.length === 0 ? (
              <div className="glass-card p-8" style={{ textAlign: 'center', color: 'var(--ink-50)' }}>
                <p style={{ fontWeight: 700 }}>No payment records for this month yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {adminPayments.map(p => {
                  const c = STATUS_CONFIG[p.status];
                  const isVerifying = verifyingId === p._id;
                  return (
                    <div key={p._id} className="glass-card p-4" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>{p.flatNo}</p>
                        <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-50)' }}>{p.residentId?.name} · {p.residentId?.email}</p>
                        {p.utrNumber && <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--ink-70)', fontFamily: 'monospace' }}>UTR: {p.utrNumber}</p>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: c.bg, color: c.color }}>{c.label}</span>
                        {p.status === 'under_verification' && (
                          <>
                            <button disabled={isVerifying} onClick={() => handleVerify(p._id, 'approve')}
                              style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#6E8F73,#4E6B54)', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                              {isVerifying ? '…' : '✓ Approve'}
                            </button>
                            <button disabled={isVerifying} onClick={() => handleVerify(p._id, 'reject')}
                              style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'transparent', color: 'var(--clay)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                              ✕ Reject
                            </button>
                          </>
                        )}
                        {(p.status === 'pending' || p.status === 'overdue') && (
                          <button disabled={isVerifying} onClick={() => handleRecordOffline(p._id, 'cash')}
                            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--line)', background: 'var(--parchment)', color: 'var(--ink-70)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                            Record Cash
                          </button>
                        )}
                        {p.status === 'paid' && <span style={{ fontSize: 12, color: '#4E6B54', fontWeight: 600 }}>{p.receiptNo}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showUpiModal && payment && (
        <UpiModal payment={payment} onClose={() => setShowUpiModal(false)} onSubmit={handleSubmitUTR} />
      )}
      {showReceipt && payment?.status === 'paid' && (
        <ReceiptModal payment={payment} onClose={() => setShowReceipt(false)} />
      )}
    </Layout>
  );
}
