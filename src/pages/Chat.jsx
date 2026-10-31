import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, Hash, User, Plus, Search, X, Circle, CheckCheck, Loader2, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Layout from '../components/Layout';

const CHANNELS = [
  { id: 'general', name: 'general', label: 'General Lounge', icon: '💬', desc: 'Open discussion for all residents' },
  { id: 'announcements', name: 'announcements', label: 'Announcements', icon: '📢', desc: 'Important society updates' },
  { id: 'buy-sell-chat', name: 'buy-sell-chat', label: 'Buy & Sell Chat', icon: '🛍️', desc: 'Discuss items and deals' },
];

function NewChatModal({ onClose, onSelectMember }) {
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { activeCommunityId } = useAuth();

  useEffect(() => {
    async function fetchMembers() {
      try {
        const { data } = await api.get(`/chat/members?communityId=${activeCommunityId}`);
        setMembers(data);
      } catch {
        toast.error('Failed to load residents');
      } finally {
        setLoading(false);
      }
    }
    if (activeCommunityId) fetchMembers();
  }, [activeCommunityId]);

  const filtered = members.filter((m) =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.flatNo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(32,38,31,0.4)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: 440, maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 24, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-50)' }}>
          <X style={{ width: 18, height: 18 }} />
        </button>

        <h2 style={{ margin: '0 0 16px', fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>Message a Resident</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--parchment-card)', border: '1px solid var(--line)', borderRadius: 10, padding: '8px 12px', marginBottom: 16 }}>
          <Search style={{ width: 15, height: 15, color: 'var(--ink-50)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or flat..."
            style={{ border: 'none', background: 'none', outline: 'none', fontSize: 13, width: '100%', color: 'var(--ink)' }}
            autoFocus
          />
        </div>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-50)', fontSize: 13 }}>Loading residents...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-50)', fontSize: 13 }}>No residents found</div>
          ) : (
            filtered.map((member) => (
              <button
                key={member._id}
                onClick={() => { onSelectMember(member); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 10,
                  border: '1px solid transparent', background: 'transparent', cursor: 'pointer', textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                className="sidebar-user-card"
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,var(--clay),var(--brick))', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {member.avatarUrl ? <img src={member.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : member.name?.charAt(0)}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: 'var(--ink)' }}>{member.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-50)' }}>Flat {member.flatNo || 'Resident'}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const { user, activeCommunityId } = useAuth();
  const { socket, joinCommunity, leaveCommunity } = useSocket();

  const [activeTab, setActiveTab] = useState('channel'); // 'channel' | 'dm'
  const [activeChannel, setActiveChannel] = useState('general');
  const [activePartner, setActivePartner] = useState(null); // User object for DM

  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [typingUser, setTypingUser] = useState('');

  // Edit & Delete state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Join community socket room
  useEffect(() => {
    if (!socket || !activeCommunityId) return;
    joinCommunity(activeCommunityId);
    return () => leaveCommunity(activeCommunityId);
  }, [socket, activeCommunityId, joinCommunity, leaveCommunity]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch active conversations list
  const fetchConversations = useCallback(async () => {
    if (!activeCommunityId) return;
    try {
      const { data } = await api.get(`/chat/conversations?communityId=${activeCommunityId}`);
      setConversations(data);
    } catch {
      // silent
    }
  }, [activeCommunityId]);

  // Fetch messages for current active thread
  const fetchMessages = useCallback(async () => {
    if (!activeCommunityId) return;
    if (activeTab === 'dm' && !activePartner) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const query = activeTab === 'dm'
        ? `communityId=${activeCommunityId}&recipientId=${activePartner._id}`
        : `communityId=${activeCommunityId}&channel=${activeChannel}`;

      const { data } = await api.get(`/chat/messages?${query}`);
      setMessages(data);
      setTimeout(scrollToBottom, 100);
      fetchConversations();
    } catch (err) {
      console.error('Failed to load chat messages:', err);
      toast.error('Failed to load chat messages');
    } finally {
      setLoading(false);
    }
  }, [activeCommunityId, activeTab, activeChannel, activePartner, fetchConversations]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Socket.IO realtime listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      const myId = (user?.id || user?._id)?.toString();
      const senderId = (msg.sender?._id || msg.sender?.id || msg.sender)?.toString();
      const recipientId = (msg.recipient?._id || msg.recipient?.id || msg.recipient)?.toString();

      // Check if message belongs to current open view
      const isCurrentDM = activeTab === 'dm' && activePartner && (
        (senderId === activePartner._id?.toString() && recipientId === myId) ||
        (senderId === myId && recipientId === activePartner._id?.toString())
      );
      const isCurrentChannel = activeTab === 'channel' && !msg.recipient && msg.channel === activeChannel;

      if (isCurrentDM || isCurrentChannel) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        setTimeout(scrollToBottom, 100);
      }

      fetchConversations();
    };

    const handleEditedMessage = (editedMsg) => {
      setMessages((prev) => prev.map((m) => (m._id === editedMsg._id ? editedMsg : m)));
    };

    const handleDeletedMessage = ({ id }) => {
      setMessages((prev) => prev.filter((m) => m._id !== id));
      fetchConversations();
    };

    const handleTyping = (data) => {
      if (data.userName === user?.name) return;

      const isCurrentDM = activeTab === 'dm' && activePartner && data.recipientId === user._id;
      const isCurrentChannel = activeTab === 'channel' && data.channel === activeChannel;

      if (isCurrentDM || isCurrentChannel) {
        if (data.isTyping) {
          setTypingUser(data.userName);
        } else {
          setTypingUser('');
        }
      }
    };

    socket.on('chat:message', handleNewMessage);
    socket.on('chat:message-edited', handleEditedMessage);
    socket.on('chat:message-deleted', handleDeletedMessage);
    socket.on('chat:typing', handleTyping);

    return () => {
      socket.off('chat:message', handleNewMessage);
      socket.off('chat:message-edited', handleEditedMessage);
      socket.off('chat:message-deleted', handleDeletedMessage);
      socket.off('chat:typing', handleTyping);
    };
  }, [socket, activeTab, activeChannel, activePartner, user, fetchConversations]);

  // Handle typing notification to socket
  const handleInputChange = (e) => {
    setText(e.target.value);
    if (!socket || !activeCommunityId) return;

    socket.emit('chat:typing', {
      communityId: activeCommunityId,
      channel: activeChannel,
      recipientId: activePartner?._id,
      userName: user?.name,
      isTyping: true,
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('chat:typing', {
        communityId: activeCommunityId,
        channel: activeChannel,
        recipientId: activePartner?._id,
        userName: user?.name,
        isTyping: false,
      });
    }, 2000);
  };

  // Send message submit
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const payload = {
      communityId: activeCommunityId,
      text: text.trim(),
      ...(activeTab === 'dm' ? { recipientId: activePartner._id } : { channel: activeChannel }),
    };

    setText('');
    try {
      const { data } = await api.post('/chat/send', payload);
      setMessages((prev) => {
        if (prev.some((m) => m._id === data._id)) return prev;
        return [...prev, data];
      });
      setTimeout(scrollToBottom, 100);
      fetchConversations();
    } catch {
      toast.error('Failed to send message');
    }
  };

  // Handle Start Edit
  const handleStartEdit = (msg) => {
    setEditingId(msg._id);
    setEditText(msg.text);
  };

  // Save Edit submit
  const handleSaveEdit = async (msgId) => {
    if (!editText.trim()) return;
    setEditLoading(true);
    try {
      const { data } = await api.patch(`/chat/messages/${msgId}`, { text: editText.trim() });
      setMessages((prev) => prev.map((m) => (m._id === msgId ? data : m)));
      setEditingId(null);
      toast.success('Message edited');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to edit message');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await api.delete(`/chat/messages/${msgId}`);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      toast.success('Message deleted');
      fetchConversations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const activeChannelObj = CHANNELS.find((c) => c.name === activeChannel);

  return (
    <Layout>
      <div style={{ display: 'flex', height: 'calc(100vh - 110px)', background: 'var(--parchment-card)', borderRadius: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>

        {/* ── Left Sidebar (Channels & DMs) ── */}
        <div style={{ width: 280, borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column', flexShrink: 0, background: 'rgba(246,245,239,0.5)' }}>

          {/* Tab header switcher */}
          <div style={{ padding: 14, borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 4, padding: 3, background: 'var(--parchment)', borderRadius: 10, border: '1px solid var(--line)' }}>
              <button
                onClick={() => setActiveTab('channel')}
                style={{
                  padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                  background: activeTab === 'channel' ? 'linear-gradient(135deg,var(--sage),var(--clay))' : 'transparent',
                  color: activeTab === 'channel' ? '#fff' : 'var(--ink-70)',
                }}
              >
                Channels
              </button>
              <button
                onClick={() => setActiveTab('dm')}
                style={{
                  padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer',
                  background: activeTab === 'dm' ? 'linear-gradient(135deg,var(--sage),var(--clay))' : 'transparent',
                  color: activeTab === 'dm' ? '#fff' : 'var(--ink-70)',
                }}
              >
                Direct DMs
              </button>
            </div>

            {activeTab === 'dm' && (
              <button
                onClick={() => setShowNewChat(true)}
                style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--line)', background: 'var(--parchment-card)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="New Direct Message"
              >
                <Plus style={{ width: 16, height: 16 }} />
              </button>
            )}
          </div>

          {/* List area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {activeTab === 'channel' ? (
              /* Channels List */
              CHANNELS.map((ch) => {
                const isActive = activeTab === 'channel' && activeChannel === ch.name;
                return (
                  <button
                    key={ch.id}
                    onClick={() => { setActiveTab('channel'); setActiveChannel(ch.name); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
                      border: '1px solid transparent', textAlign: 'left', cursor: 'pointer', width: '100%',
                      background: isActive ? 'linear-gradient(135deg,#c97b5a,#ad6247)' : 'transparent',
                      color: isActive ? '#fff' : 'var(--ink-70)',
                      fontWeight: isActive ? 700 : 500, fontSize: 13,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{ch.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>#{ch.name}</p>
                    </div>
                  </button>
                );
              })
            ) : (
              /* DMs Conversations List */
              conversations.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--ink-50)', fontSize: 13 }}>
                  No active messages yet. Click <strong>+</strong> above to message a neighbour!
                </div>
              ) : (
                conversations.map((conv) => {
                  const partner = conv.partner;
                  const isActive = activeTab === 'dm' && activePartner?._id === partner?._id;
                  return (
                    <button
                      key={partner._id}
                      onClick={() => { setActiveTab('dm'); setActivePartner(partner); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10,
                        border: '1px solid transparent', textAlign: 'left', cursor: 'pointer', width: '100%',
                        background: isActive ? 'linear-gradient(135deg,#c97b5a,#ad6247)' : 'transparent',
                        color: isActive ? '#fff' : 'var(--ink-70)',
                      }}
                    >
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,var(--clay),var(--brick))', color: '#fff', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                        {partner.avatarUrl ? <img src={partner.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : partner.name?.charAt(0)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{partner.name}</p>
                          {conv.unreadCount > 0 && (
                            <span style={{ background: 'var(--clay)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 99 }}>
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '2px 0 0', fontSize: 11, opacity: 0.7, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {conv.lastMessage?.text || 'Sent an attachment'}
                        </p>
                      </div>
                    </button>
                  );
                })
              )
            )}
          </div>
        </div>

        {/* ── Right Panel (Chat Thread & Input) ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Active Thread Header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(246,245,239,0.3)' }}>
            {activeTab === 'channel' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>{activeChannelObj?.icon}</span>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>#{activeChannel}</h3>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-50)' }}>{activeChannelObj?.desc}</p>
                </div>
              </div>
            ) : activePartner ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,var(--clay),var(--brick))', color: '#fff', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {activePartner.avatarUrl ? <img src={activePartner.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : activePartner.name?.charAt(0)}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>{activePartner.name}</h3>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--sage)', fontWeight: 600 }}>Flat {activePartner.flatNo || 'Resident'}</p>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>Direct Messages</h3>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--ink-50)' }}>Select a resident from the left to chat</p>
              </div>
            )}
          </div>

          {/* Message Stream */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ink-50)' }}>
                <Loader2 style={{ width: 24, height: 24, animation: 'spin 1s linear infinite' }} />
              </div>
            ) : activeTab === 'dm' && !activePartner ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ink-50)' }}>
                <MessageSquare style={{ width: 40, height: 40, marginBottom: 12, opacity: 0.5 }} />
                <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>Select a resident to start messaging</p>
              </div>
            ) : messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--ink-50)' }}>
                <p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>No messages in this chat yet</p>
                <p style={{ fontSize: 12, margin: '4px 0 0' }}>Say hi to start the conversation! 👋</p>
              </div>
            ) : (
              messages.map((msg) => {
                const myId = (user?.id || user?._id)?.toString();
                const senderId = (msg.sender?._id || msg.sender?.id || msg.sender)?.toString();
                const isMe = Boolean(myId && senderId && myId === senderId);
                const timeStr = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                
                // 5-minute window calculation
                const diffMs = Date.now() - new Date(msg.createdAt).getTime();
                const diffMins = diffMs / (1000 * 60);
                const isWithin5Min = diffMins <= 5;

                const canEdit = isMe && isWithin5Min;
                const canDelete = (isMe && isWithin5Min) || isAdmin;

                const isEditingThis = editingId === msg._id;

                return (
                  <div
                    key={msg._id}
                    className="group"
                    style={{
                      display: 'flex', gap: 10, maxWidth: '75%',
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      flexDirection: isMe ? 'row-reverse' : 'row',
                      position: 'relative',
                    }}
                  >
                    {!isMe && (
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,var(--sage),var(--clay))', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, marginTop: 2 }}>
                        {msg.sender?.avatarUrl ? <img src={msg.sender.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : msg.sender?.name?.charAt(0)}
                      </div>
                    )}

                    <div style={{ position: 'relative', maxWidth: '100%' }}>
                      {!isMe && activeTab === 'channel' && (
                        <p style={{ margin: '0 0 3px 4px', fontSize: 11, fontWeight: 700, color: 'var(--ink-70)' }}>{msg.sender?.name}</p>
                      )}

                      {/* Inline Edit Input Form */}
                      {isEditingThis ? (
                        <div style={{ background: 'var(--parchment-card)', border: '1.5px solid var(--clay)', borderRadius: 12, padding: 8, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 240 }}>
                          <input
                            type="text"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="glass-input"
                            style={{ width: '100%', padding: '6px 10px', fontSize: 13 }}
                            autoFocus
                          />
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--line)', background: 'transparent', color: 'var(--ink-70)', fontSize: 11, cursor: 'pointer' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={editLoading || !editText.trim()}
                              onClick={() => handleSaveEdit(msg._id)}
                              style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: 'linear-gradient(135deg,var(--sage),var(--clay))', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                            >
                              {editLoading ? 'Saving…' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          style={{
                            padding: '10px 14px', borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                            background: isMe ? 'linear-gradient(135deg,#c97b5a,#ad6247)' : 'var(--parchment)',
                            color: isMe ? '#fff' : 'var(--ink)',
                            boxShadow: isMe ? '0 4px 14px rgba(201,123,90,0.25)' : '0 2px 8px rgba(32,38,31,0.06)',
                            border: isMe ? 'none' : '1px solid var(--line)',
                            fontSize: 13.5, lineHeight: 1.4, wordBreak: 'break-word',
                            position: 'relative',
                          }}
                        >
                          {msg.text}

                          {/* Hover Actions (Edit / Delete) */}
                          {(canEdit || canDelete) && (
                            <div
                              className="chat-message-actions"
                              style={{
                                position: 'absolute', top: -14, right: isMe ? 'auto' : 8, left: isMe ? 8 : 'auto',
                                background: 'var(--parchment-card)', border: '1px solid var(--line)',
                                borderRadius: 8, padding: '2px 4px', gap: 4, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              }}
                            >
                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => handleStartEdit(msg)}
                                  style={{ padding: 4, background: 'none', border: 'none', color: 'var(--ink-70)', cursor: 'pointer' }}
                                  title="Edit message (within 5 min)"
                                >
                                  <Edit2 style={{ width: 12, height: 12 }} />
                                </button>
                              )}
                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMessage(msg._id)}
                                  style={{ padding: 4, background: 'none', border: 'none', color: 'var(--clay)', cursor: 'pointer' }}
                                  title={isAdmin && !isMe ? 'Delete message (Admin)' : 'Delete message (within 5 min)'}
                                >
                                  <Trash2 style={{ width: 12, height: 12 }} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <p style={{ margin: '3px 4px 0', fontSize: 10, color: 'var(--ink-50)', textAlign: isMe ? 'right' : 'left' }}>
                        {timeStr} {msg.isEdited && <span style={{ fontStyle: 'italic', opacity: 0.8 }}>(edited)</span>}
                      </p>
                    </div>
                  </div>
                );
              })
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Typing Indicator */}
          {typingUser && (
            <div style={{ padding: '2px 20px 6px', fontSize: 11, color: 'var(--sage)', fontWeight: 600, fontStyle: 'italic' }}>
              {typingUser} is typing...
            </div>
          )}

          {/* Input Form */}
          {(activeTab === 'channel' || activePartner) && (
            <form onSubmit={handleSend} style={{ padding: 14, borderTop: '1px solid var(--line)', display: 'flex', gap: 10, background: 'var(--parchment-card)' }}>
              <input
                type="text"
                value={text}
                onChange={handleInputChange}
                placeholder={activeTab === 'channel' ? `Message #${activeChannel}...` : `Message ${activePartner?.name}...`}
                className="glass-input"
                style={{ flex: 1, borderRadius: 12, padding: '10px 16px' }}
              />
              <button
                type="submit"
                disabled={!text.trim()}
                style={{
                  width: 42, height: 42, borderRadius: 12, border: 'none',
                  background: text.trim() ? 'linear-gradient(135deg,var(--clay),var(--brick))' : 'var(--line)',
                  color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: text.trim() ? 'pointer' : 'default', transition: 'all 0.2s',
                  boxShadow: text.trim() ? '0 4px 14px rgba(201,123,90,0.3)' : 'none',
                }}
              >
                <Send style={{ width: 16, height: 16 }} />
              </button>
            </form>
          )}
        </div>

      </div>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onSelectMember={(member) => {
            setActiveTab('dm');
            setActivePartner(member);
          }}
        />
      )}
    </Layout>
  );
}
