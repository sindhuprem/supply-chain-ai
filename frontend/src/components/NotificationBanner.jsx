import React, { useEffect, useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, RefreshCw, X } from 'lucide-react';

export default function NotificationBanner({ lastMessage }) {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!lastMessage || !lastMessage.type) return;

    let banner = null;
    const { type, order_id, data } = lastMessage;

    if (type === 'order_status_changed') {
      banner = {
        title: 'Order Status Updated',
        message: `Order #${data?.order_number || order_id} is now ${data?.status?.toUpperCase()}`,
        type: 'info'
      };
    } else if (type === 'disruption_reported') {
      banner = {
        title: 'Disruption Alert!',
        message: `Disruption reported on Order #${order_id}. AI Multi-Agent Pipeline activated.`,
        type: 'warning'
      };
    } else if (type === 'route_updated') {
      banner = {
        title: 'Route Optimized',
        message: `New bypass route computed by AI agents for Order #${order_id}.`,
        type: 'success'
      };
    }

    if (banner) {
      setNotification(banner);
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [lastMessage]);

  if (!notification) return null;

  const bgStyles = {
    info: 'bg-blue-950/90 border-blue-600 text-blue-200',
    warning: 'bg-amber-950/90 border-amber-600 text-amber-200',
    success: 'bg-emerald-950/90 border-emerald-600 text-emerald-200'
  }[notification.type] || 'bg-slate-900 border-slate-700 text-slate-200';

  return (
    <div className="fixed top-16 right-4 z-50 max-w-md w-full animate-slideIn">
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start justify-between space-x-3 ${bgStyles}`}>
        <div className="flex items-start space-x-3">
          {notification.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <Bell className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">{notification.title}</h4>
            <p className="text-xs mt-0.5 opacity-90">{notification.message}</p>
          </div>
        </div>
        <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
