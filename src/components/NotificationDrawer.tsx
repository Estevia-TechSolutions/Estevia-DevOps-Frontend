import React, { useState, useMemo } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info, Trash2, BellOff, ChevronDown, ChevronRight, Clock, ArrowRight, Check } from 'lucide-react';

export interface AppNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onClearAll: () => void;
  onDeleteNotification: (id: string) => void;
  onViewDetails?: (category: string, notification: AppNotification) => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearAll,
  onDeleteNotification,
  onViewDetails,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'unread'>('all');
  const [groupingMode, setGroupingMode] = useState<'date' | 'category'>('date');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [expandedNotifications, setExpandedNotifications] = useState<Record<string, boolean>>({});

  // Calculate dynamic relative time labels
  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHrs = Math.floor(diffMins / 60);
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.floor(diffHrs / 24);
      if (diffDays === 1) return 'Yesterday';
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  // Format absolute timestamp for tooltips
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  // Dynamic relative day tag for grouping
  const getRelativeDay = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
      return 'Earlier';
    } catch (e) {
      return 'Earlier';
    }
  };

  // Dynamic Operations Tagging
  const getCategoryTag = (title: string, message: string) => {
    const t = (title + ' ' + message).toLowerCase();
    if (t.includes('remediation') || t.includes('optimize') || t.includes('cost') || t.includes('savings') || t.includes('bill') || t.includes('finops')) {
      return { label: 'FINOPS', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.2)' };
    }
    if (t.includes('security') || t.includes('credentials') || t.includes('secrets') || t.includes('keyvault') || t.includes('token') || t.includes('audit')) {
      return { label: 'SECURITY', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.2)' };
    }
    if (t.includes('provision') || t.includes('database') || t.includes('pipeline') || t.includes('deploy') || t.includes('backup') || t.includes('swap')) {
      return { label: 'PROVISION', color: '#34d399', bg: 'rgba(52, 211, 153, 0.08)', border: 'rgba(52, 211, 153, 0.2)' };
    }
    if (t.includes('scan') || t.includes('infrastructure') || t.includes('telemetry') || t.includes('agent') || t.includes('monitor') || t.includes('observability')) {
      return { label: 'MONITOR', color: '#a78bfa', bg: 'rgba(167, 139, 250, 0.08)', border: 'rgba(167, 139, 250, 0.2)' };
    }
    return { label: 'SYSTEM', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.08)', border: 'rgba(56, 189, 248, 0.2)' };
  };

  const hasUnread = useMemo(() => notifications.some(n => !n.read), [notifications]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (filterTab === 'unread') return !n.read;
      return true;
    });
  }, [notifications, filterTab]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, AppNotification[]> = {};
    filteredNotifications.forEach(n => {
      const key = groupingMode === 'date' 
        ? getRelativeDay(n.timestamp) 
        : getCategoryTag(n.title, n.message).label;

      if (!groups[key]) groups[key] = [];
      groups[key].push(n);
    });
    return groups;
  }, [filteredNotifications, groupingMode]);

  const sortedGroupKeys = useMemo(() => {
    const keys = Object.keys(groupedNotifications);
    if (groupingMode === 'date') {
      const order = ['Today', 'Yesterday', 'Earlier'];
      return keys.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    } else {
      const order = ['SECURITY', 'FINOPS', 'PROVISION', 'MONITOR', 'SYSTEM'];
      return keys.sort((a, b) => {
        const valA = order.indexOf(a) !== -1 ? order.indexOf(a) : 99;
        const valB = order.indexOf(b) !== -1 ? order.indexOf(b) : 99;
        return valA - valB;
      });
    }
  }, [groupedNotifications, groupingMode]);

  const isGroupExpanded = (key: string, items: AppNotification[]) => {
    if (expandedGroups[key] !== undefined) {
      return expandedGroups[key];
    }
    return items.some(n => !n.read) || sortedGroupKeys[0] === key;
  };

  const toggleGroup = (key: string, items: AppNotification[]) => {
    const currentlyExpanded = isGroupExpanded(key, items);
    setExpandedGroups(prev => ({ ...prev, [key]: !currentlyExpanded }));
  };

  return (
    <>
      <style>{`
        @keyframes float-bell {
          0%, 100% { transform: translateY(0) rotate(0); }
          50% { transform: translateY(-8px) rotate(4deg); }
        }
        @keyframes pulse-unread {
          0% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.4); }
          70% { box-shadow: 0 0 0 6px rgba(139, 92, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
        }
        @keyframes card-slide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .notification-card {
          animation: card-slide 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .notification-card:hover {
          transform: translateX(-4px) !important;
          border-color: var(--accent-purple) !important;
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.18) !important;
        }
        [data-theme="light"] .notification-card:hover {
          border-color: var(--accent-purple) !important;
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.15) !important;
        }
        .notif-delete-btn:hover {
          color: var(--error) !important;
          background: rgba(239, 68, 68, 0.08) !important;
        }
        .notif-check-btn:hover {
          color: var(--success) !important;
          background: rgba(34, 197, 94, 0.08) !important;
        }
        .notif-action-btn:hover {
          color: var(--accent-blue) !important;
          transform: translateX(2.5px) !important;
        }
        .group-accordion-header {
          transition: background 0.2s ease, border-color 0.2s ease;
        }
        .group-accordion-header:hover {
          background: rgba(255, 255, 255, 0.04) !important;
          border-color: rgba(255, 255, 255, 0.12) !important;
        }
        .segmented-btn {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .segmented-btn:hover:not(.active) {
          color: var(--text-primary) !important;
          background: rgba(255, 255, 255, 0.04);
        }
        .glassmorphic-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .glassmorphic-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .glassmorphic-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 10px;
        }
        .glassmorphic-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
      `}</style>

      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(2, 6, 23, 0.6)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 999,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '430px',
          maxWidth: '100vw',
          height: '100vh',
          backgroundColor: 'var(--bg-header)',
          backdropFilter: 'blur(45px) saturate(180%)',
          WebkitBackdropFilter: 'blur(45px) saturate(180%)',
          borderLeft: '1px solid var(--glass-border)',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.45)',
          zIndex: 1000,
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(255, 255, 255, 0.015)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Notification Hub
            </span>
            {notifications.length > 0 && (
              <span 
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  backgroundColor: 'var(--accent-purple)',
                  color: '#fff',
                  padding: '1px 7px',
                  borderRadius: '10px',
                  boxShadow: '0 0 10px var(--accent-purple-glow)',
                }}
              >
                {notifications.length}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {hasUnread && onMarkAllAsRead && (
              <button 
                onClick={onMarkAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'none'; }}
              >
                <Check size={12} />
                Mark all read
              </button>
            )}

            {notifications.length > 0 && (
              <button 
                onClick={onClearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'none'; }}
              >
                <Trash2 size={12} />
                Clear All
              </button>
            )}

            <button 
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--glass-border)',
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        {notifications.length > 0 && (
          <div style={{ padding: '14px 24px 0 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Filter Tabs */}
            <div style={{
              display: 'flex',
              borderRadius: '8px',
              backgroundColor: 'rgba(0,0,0,0.18)',
              padding: '2.5px',
              border: '1px solid var(--glass-border)'
            }}>
              <button
                onClick={() => setFilterTab('all')}
                className={`segmented-btn ${filterTab === 'all' ? 'active' : ''}`}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: filterTab === 'all' ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' : 'transparent',
                  color: filterTab === 'all' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  boxShadow: filterTab === 'all' ? '0 2px 8px var(--accent-blue-glow)' : 'none',
                  cursor: 'pointer'
                }}
              >
                All Notifications
              </button>
              <button
                onClick={() => setFilterTab('unread')}
                className={`segmented-btn ${filterTab === 'unread' ? 'active' : ''}`}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: filterTab === 'unread' ? 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' : 'transparent',
                  color: filterTab === 'unread' ? '#fff' : 'var(--text-secondary)',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  boxShadow: filterTab === 'unread' ? '0 2px 8px var(--accent-blue-glow)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  cursor: 'pointer'
                }}
              >
                Unread Only
                {notifications.filter(n => !n.read).length > 0 && (
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    backgroundColor: filterTab === 'unread' ? 'rgba(255,255,255,0.2)' : 'var(--accent-purple)',
                    color: '#fff',
                    padding: '1px 5px',
                    borderRadius: '4px'
                  }}>
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
            </div>

            {/* Grouping switch */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>GROUPING OPTIONS:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => setGroupingMode('date')}
                  style={{
                    background: groupingMode === 'date' ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: '1px solid ' + (groupingMode === 'date' ? 'var(--glass-border)' : 'transparent'),
                    borderRadius: '5px',
                    color: groupingMode === 'date' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '3px 8px',
                    fontSize: '0.68rem',
                    fontWeight: 600
                  }}
                >
                  By Date
                </button>
                <button
                  onClick={() => setGroupingMode('category')}
                  style={{
                    background: groupingMode === 'category' ? 'rgba(255,255,255,0.06)' : 'transparent',
                    border: '1px solid ' + (groupingMode === 'category' ? 'var(--glass-border)' : 'transparent'),
                    borderRadius: '5px',
                    color: groupingMode === 'category' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    padding: '3px 8px',
                    fontSize: '0.68rem',
                    fontWeight: 600
                  }}
                >
                  By Category
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Notifications Accordions List */}
        <div 
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
          className="glassmorphic-scroll"
        >
          {filteredNotifications.length === 0 ? (
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-secondary)',
                gap: '12px',
                opacity: 0.8,
              }}
            >
              <div 
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--glass-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  animation: 'float-bell 3.5s ease-in-out infinite'
                }}
              >
                <BellOff size={22} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  All caught up!
                </span>
                <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  No notifications fit the active filter criteria.
                </span>
              </div>
            </div>
          ) : (
            sortedGroupKeys.map((groupKey) => {
              const groupItems = groupedNotifications[groupKey] || [];
              if (groupItems.length === 0) return null;
              
              const isExpanded = isGroupExpanded(groupKey, groupItems);
              const unreadInGroup = groupItems.filter(n => !n.read).length;

              return (
                <div key={groupKey} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Accordion Group Header */}
                  <div
                    onClick={() => toggleGroup(groupKey, groupItems)}
                    className="group-accordion-header"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.015)',
                      border: '1px solid var(--glass-border)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isExpanded ? (
                        <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} />
                      ) : (
                        <ChevronRight size={14} style={{ color: 'var(--text-secondary)' }} />
                      )}
                      <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                        {groupKey}
                      </span>
                      <span style={{
                        fontSize: '0.64rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(255,255,255,0.04)',
                        color: 'var(--text-secondary)',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        border: '1px solid var(--glass-border)'
                      }}>
                        {groupItems.length}
                      </span>
                      {unreadInGroup > 0 && (
                        <span style={{
                          fontSize: '0.62rem',
                          fontWeight: 700,
                          backgroundColor: 'rgba(139, 92, 246, 0.1)',
                          color: 'var(--accent-purple)',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          border: '1px solid rgba(139, 92, 246, 0.2)'
                        }}>
                          {unreadInGroup} new
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Accordion Group Body */}
                  {isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '4px' }}>
                      {groupItems.map((n) => {
                        let icon = <Info size={13} style={{ color: 'var(--accent-blue)' }} />;
                        let iconBg = 'rgba(59, 130, 246, 0.08)';
                        let borderCol = 'rgba(59, 130, 246, 0.15)';
                        let cardBg = 'linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(59, 130, 246, 0.005) 100%)';
                        let cardBorderLeft = '3px solid var(--accent-blue, #3b82f6)';
                        let unreadShadow = 'rgba(59, 130, 246, 0.06)';

                        if (n.type === 'success') {
                          icon = <CheckCircle2 size={13} style={{ color: 'var(--success)' }} />;
                          iconBg = 'rgba(34, 197, 94, 0.08)';
                          borderCol = 'rgba(34, 197, 94, 0.15)';
                          cardBg = 'linear-gradient(135deg, rgba(16, 185, 129, 0.04) 0%, rgba(16, 185, 129, 0.005) 100%)';
                          cardBorderLeft = '3px solid var(--success, #10b981)';
                          unreadShadow = 'rgba(16, 185, 129, 0.06)';
                        } else if (n.type === 'warning') {
                          icon = <AlertTriangle size={13} style={{ color: 'var(--warning)' }} />;
                          iconBg = 'rgba(245, 158, 11, 0.08)';
                          borderCol = 'rgba(245, 158, 11, 0.15)';
                          cardBg = 'linear-gradient(135deg, rgba(245, 158, 11, 0.04) 0%, rgba(245, 158, 11, 0.005) 100%)';
                          cardBorderLeft = '3px solid var(--warning, #f59e0b)';
                          unreadShadow = 'rgba(245, 158, 11, 0.06)';
                        } else if (n.type === 'error') {
                          icon = <AlertCircle size={13} style={{ color: 'var(--error)' }} />;
                          iconBg = 'rgba(239, 68, 68, 0.08)';
                          borderCol = 'rgba(239, 68, 68, 0.15)';
                          cardBg = 'linear-gradient(135deg, rgba(239, 68, 68, 0.04) 0%, rgba(239, 68, 68, 0.005) 100%)';
                          cardBorderLeft = '3px solid var(--error, #ef4444)';
                          unreadShadow = 'rgba(239, 68, 68, 0.06)';
                        }

                        const isCardExpanded = expandedNotifications[n.id] !== undefined
                          ? expandedNotifications[n.id]
                          : !n.read;

                        const category = getCategoryTag(n.title, n.message);

                        // Card wrapper clicks automatically mark unread card as read
                        const handleCardClick = () => {
                          if (!n.read && onMarkAsRead) {
                            onMarkAsRead(n.id);
                          }
                          setExpandedNotifications(prev => ({ ...prev, [n.id]: !isCardExpanded }));
                        };

                        return (
                          <div 
                            key={n.id}
                            className="notification-card"
                            style={{
                              padding: '14px 16px',
                              borderRadius: '10px',
                              background: n.read ? 'linear-gradient(135deg, rgba(255,255,255,0.015) 0%, rgba(255,255,255,0.005) 100%)' : cardBg,
                              border: n.read ? '1px solid var(--glass-border)' : '1px solid rgba(255, 255, 255, 0.12)',
                              borderLeft: cardBorderLeft,
                              position: 'relative',
                              boxShadow: n.read ? 'none' : `0 4px 14px ${unreadShadow}`,
                            }}
                          >
                            {/* Header Row */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '10px' }}>
                              {/* Collapsible toggle trigger zone */}
                              <div 
                                onClick={handleCardClick}
                                style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: '10px', 
                                  cursor: 'pointer',
                                  flex: 1,
                                  minWidth: 0,
                                  userSelect: 'none'
                                }}
                              >
                                <div 
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '6px',
                                    backgroundColor: iconBg,
                                    border: `1px solid ${borderCol}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    animation: !n.read ? 'pulse-unread 2s infinite ease-in-out' : 'none'
                                  }}
                                >
                                  {icon}
                                </div>

                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                    <span 
                                      style={{ 
                                        fontSize: '0.78rem', 
                                        fontWeight: n.read ? 600 : 700, 
                                        color: 'var(--text-primary)',
                                        lineHeight: '1.25',
                                        whiteSpace: 'nowrap',
                                        textOverflow: 'ellipsis',
                                        overflow: 'hidden',
                                        maxWidth: '150px',
                                      }}
                                    >
                                      {n.title}
                                    </span>
                                    <span 
                                      style={{
                                        fontSize: '0.52rem',
                                        fontWeight: 800,
                                        color: category.color,
                                        background: category.bg,
                                        border: `1px solid ${category.border}`,
                                        padding: '0.5px 4.5px',
                                        borderRadius: '3px',
                                        letterSpacing: '0.03em',
                                        boxShadow: `0 0 6px ${category.bg}`,
                                        flexShrink: 0,
                                      }}
                                    >
                                      {category.label}
                                    </span>
                                  </div>
                                  
                                  {/* Time */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
                                    <Clock size={9} style={{ opacity: 0.6 }} />
                                    <span title={formatTime(n.timestamp)} style={{ cursor: 'help' }}>
                                      {getRelativeTime(n.timestamp)}
                                    </span>
                                  </div>
                                </div>

                                {/* Collapse/Expand chevron */}
                                <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {isCardExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                </div>
                              </div>

                              {/* Non-trigger operations zone: unread dot/check + delete trigger */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                {!n.read && onMarkAsRead && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onMarkAsRead(n.id);
                                    }}
                                    className="notif-check-btn"
                                    title="Mark as read"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--text-muted)',
                                      cursor: 'pointer',
                                      padding: '5px',
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      transition: 'all 0.2s',
                                    }}
                                  >
                                    <Check size={12} />
                                  </button>
                                )}

                                {!n.read && (
                                  <span 
                                    style={{
                                      width: '6px',
                                      height: '6px',
                                      borderRadius: '50%',
                                      backgroundColor: 'var(--accent-purple)',
                                      boxShadow: '0 0 6px var(--accent-purple)',
                                      display: 'inline-block',
                                      marginLeft: '2px',
                                    }}
                                    title="Unread"
                                  />
                                )}

                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteNotification(n.id);
                                  }}
                                  className="notif-delete-btn"
                                  title="Delete notification"
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '5px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                  }}
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>

                            {/* Expanded Detail view */}
                            {isCardExpanded && (
                              <div 
                                style={{
                                  marginTop: '10px',
                                  paddingTop: '10px',
                                  borderTop: '1px dashed var(--glass-border)',
                                }}
                              >
                                <p 
                                  style={{ 
                                    margin: 0, 
                                    fontSize: '0.74rem', 
                                    color: 'var(--text-secondary)',
                                    lineHeight: '1.45',
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {n.message}
                                </p>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                  <a 
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (onViewDetails) {
                                        onViewDetails(category.label, n);
                                      } else {
                                        onClose();
                                      }
                                    }}
                                    className="notif-action-btn"
                                    style={{
                                      fontSize: '0.68rem',
                                      color: 'var(--accent-purple)',
                                      fontWeight: 700,
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <span>View Details</span>
                                    <ArrowRight size={9} />
                                  </a>
                                  </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};
