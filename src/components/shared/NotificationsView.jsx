import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Mail, ChevronDown, ChevronUp } from 'lucide-react';

export default function NotificationsView({ notifications = [], onMarkRead }) {
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [localNotifications, setLocalNotifications] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Sini-sync sa parent notifications state
  useEffect(() => {
    setLocalNotifications(notifications);
  }, [notifications]);

  const filtered = localNotifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = localNotifications.filter(n => !n.read).length;

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 font-sans">
      
      {/* Header bar */}
      <div className="border-b border-slate-100 pb-3 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/10">
        <div>
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-5 h-5 text-[#7c191e]" /> Quality Assurance Notifications Center
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">Track systemic mail dispatches, alerts, and pending tracer compliance metrics.</p>
        </div>
      </div>

      {/* Tabs at Actions bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex gap-1 bg-slate-105 p-0.5 rounded-lg w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${
              filter === 'all' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-505 hover:text-slate-700'
            }`}
          >
            All Alerts ({localNotifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition ${
              filter === 'unread' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-505 hover:text-slate-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => {
              localNotifications.forEach(n => {
                if (!n.read) onMarkRead(n.id);
              });
            }}
            className="text-[10px] text-[#7c191e] hover:underline font-bold uppercase self-end sm:self-center"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Listahan ng mga Notification */}
      <div className="space-y-4">
        {filtered.map(notify => {
          const isExpanded = expandedIds.has(notify.id);
          return (
            <div 
              key={notify.id} 
              onClick={() => toggleExpand(notify.id)}
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 transition cursor-pointer select-none hover:border-slate-350 dark:hover:border-slate-650 animate-fade-in ${
                notify.read 
                  ? 'bg-slate-50 border-slate-100 opacity-80' 
                  : 'bg-[#7c191e]/5 border-[#7c191e]/15'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className={`p-2 bg-white rounded-lg border shrink-0 mt-0.5 shadow-2xs ${
                  notify.read ? 'text-slate-400 border-slate-100' : 'text-[#7c191e] border-[#7c191e]/20'
                }`}>
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 text-xs flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-extrabold ${notify.read ? 'text-slate-755' : 'text-slate-900'} truncate`}>
                      {notify.title}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </div>
                  {isExpanded && (
                    <div className="space-y-2 mt-2 transition-all duration-300">
                      <p className="text-slate-600 font-semibold leading-relaxed break-words whitespace-pre-line bg-white/50 p-2.5 rounded-lg border border-slate-100/50">
                        {notify.text}
                      </p>
                      <span className="text-[10px] text-slate-450 font-bold block inline-flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {new Date(notify.date).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // Avoid triggering toggleExpand
                  onMarkRead(notify.id);
                }}
                className={`p-1 px-2.5 bg-white border rounded-md text-[10px] font-bold transition flex items-center gap-1 shrink-0 ${
                  notify.read
                    ? 'border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                    : 'border-[#7c191e]/20 text-[#7c191e] hover:bg-[#7c191e]/5'
                }`}
                title={notify.read ? 'Mark as Unread' : 'Mark as Read'}
              >
                <Check className={`w-3.5 h-3.5 ${notify.read ? 'text-slate-300' : 'text-[#7c191e]'}`} />
                {notify.read ? 'Mark Unread' : 'Read'}
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-xl border border-slate-100">
            No active notification logs found.
          </div>
        )}
      </div>

    </div>
  );
}

