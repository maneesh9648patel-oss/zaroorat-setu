import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Heart, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function NotificationBell() {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.matching.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      // silently fail if guest or offline
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.uid]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.matching.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      // ignore
    }
  };

  const handleRespondMatch = async (matchId, action, notifId) => {
    setActionLoadingId(matchId);
    try {
      await api.matching.respondMatch({ matchId, action });
      await handleMarkRead(notifId);
      await fetchNotifications();
    } catch (err) {
      alert(err.message || "Failed to respond to match request");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          fetchNotifications();
        }}
        className="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-cream flex items-center justify-center transition focus:outline-none"
        title="Smart Matching Alerts & Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-terracotta text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-darkbrown/10 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-darkbrown to-darkbrown/95 text-cream flex items-center justify-between border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-softYellow" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Matching Notifications
              </h3>
            </div>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-terracotta text-white text-[10px] font-bold">
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-darkbrown/5 p-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-darkbrown/50 space-y-1">
                <Bell className="w-8 h-8 mx-auto text-darkbrown/20 stroke-1" />
                <p className="font-bold">कोई नई सूचना नहीं है (No new alerts)</p>
                <p className="text-[10px]">When AI matches or assistance arrives, you will be notified here.</p>
              </div>
            ) : (
              notifications.map(notif => {
                const isMatchRequest = notif.type === 'match_request';
                const matchId = notif.data?.matchId;

                return (
                  <div 
                    key={notif.id}
                    className={`p-3.5 transition rounded-2xl m-1 ${
                      notif.read ? 'bg-white opacity-80' : 'bg-cream/50 border border-teal/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-teal shrink-0 mt-1.5" />
                        <div>
                          <h4 className="text-xs font-black text-darkbrown leading-tight">
                            {notif.title}
                          </h4>
                          <p className="text-[11px] text-darkbrown/80 mt-0.5 leading-snug">
                            {notif.message}
                          </p>
                        </div>
                      </div>

                      {!notif.read && (
                        <button
                          onClick={() => handleMarkRead(notif.id)}
                          className="text-[10px] text-teal hover:underline font-bold shrink-0"
                          title="Mark as read"
                        >
                          ✓ Read
                        </button>
                      )}
                    </div>

                    {/* Donor Action Buttons if this is an incoming match request */}
                    {isMatchRequest && matchId && (
                      <div className="mt-3 pt-2 border-t border-darkbrown/10 flex items-center gap-2">
                        <button
                          onClick={() => handleRespondMatch(matchId, 'accept', notif.id)}
                          disabled={actionLoadingId === matchId}
                          className="flex-1 py-1.5 px-3 rounded-full bg-teal hover:bg-teal-dark text-white text-[11px] font-black transition flex items-center justify-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept (स्वीकार करें)</span>
                        </button>
                        <button
                          onClick={() => handleRespondMatch(matchId, 'decline', notif.id)}
                          disabled={actionLoadingId === matchId}
                          className="py-1.5 px-3 rounded-full border border-darkbrown/20 text-darkbrown hover:bg-darkbrown/5 text-[11px] font-bold transition"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
