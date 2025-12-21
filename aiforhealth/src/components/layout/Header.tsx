import { useState, useEffect } from 'react';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const unreadNotifications = await notificationService.getUnreadNotifications();
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNavigate = (url: string) => {
    navigate(url);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-medical-600">AIforHealth</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notification System */}
          <div className="relative">
            <NotificationBadge
              count={unreadCount}
              onClick={handleNotificationClick}
            />
            <NotificationDropdown
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              onNavigate={handleNavigate}
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-medical-100 rounded-full flex items-center justify-center">
              <User size={16} className="text-medical-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:text-gray-900"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}