import { useState, useEffect } from 'react';
import { Bell, Filter, CheckCheck, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { ReminderCard } from '@/components/notifications/ReminderCard';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { StatCard } from '@/components/dashboard/StatCard';
import { notificationService } from '@/services/notificationService';
import type { Notification, NotificationStats } from '@/types/notification';
import { useNavigate } from 'react-router-dom';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'appointment-reminder' | 'missed-appointment' | 'follow-up'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await notificationService.getNotificationStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading notification stats:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      loadStats();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      loadStats();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      loadStats();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleAction = (url: string) => {
    navigate(url);
  };

  const handleSnooze = async (id: string, minutes: number) => {
    // In a real app, this would snooze the notification
    console.log(`Snoozing notification ${id} for ${minutes} minutes`);
    handleDelete(id);
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'appointment-reminder':
      case 'missed-appointment':
      case 'follow-up':
        return notification.type === filter;
      default:
        return true;
    }
  });

  const filterOptions = [
    { value: 'all', label: 'All Notifications' },
    { value: 'unread', label: 'Unread Only' },
    { value: 'appointment-reminder', label: 'Appointment Reminders' },
    { value: 'missed-appointment', label: 'Missed Appointments' },
    { value: 'follow-up', label: 'Follow-up Suggestions' }
  ];

  const priorityNotifications = filteredNotifications.filter(n => 
    (n.priority === 'urgent' || n.priority === 'high') && !n.read
  );

  const regularNotifications = filteredNotifications.filter(n => 
    !(n.priority === 'urgent' || n.priority === 'high') || n.read
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">Stay updated with your health reminders and appointments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/app/notifications/settings')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          {stats && stats.unread > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Notifications"
            value={stats.total}
            icon={<Bell className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="Unread"
            value={stats.unread}
            icon={<Bell className="h-6 w-6" />}
            variant={stats.unread > 0 ? 'warning' : 'success'}
          />
          <StatCard
            title="Urgent"
            value={stats.byPriority.urgent}
            icon={<Bell className="h-6 w-6" />}
            variant={stats.byPriority.urgent > 0 ? 'error' : 'success'}
          />
          <StatCard
            title="Appointment Related"
            value={(stats.byType['appointment-reminder'] || 0) + (stats.byType['missed-appointment'] || 0)}
            icon={<Bell className="h-6 w-6" />}
            variant="primary"
          />
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            options={filterOptions}
          />
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('cards')}
            >
              Cards
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Priority Notifications */}
      {priorityNotifications.length > 0 && (
        <DashboardWidget
          title="Priority Notifications"
          icon={<Bell className="h-5 w-5" />}
          variant="error"
        >
          <div className="space-y-4">
            {priorityNotifications.map((notification) => (
              <ReminderCard
                key={notification.id}
                notification={notification}
                onDismiss={handleDelete}
                onAction={handleAction}
                onSnooze={handleSnooze}
              />
            ))}
          </div>
        </DashboardWidget>
      )}

      {/* Regular Notifications */}
      <DashboardWidget
        title="All Notifications"
        icon={<Bell className="h-5 w-5" />}
        action={
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{filter}</span>
          </div>
        }
      >
        {regularNotifications.length > 0 ? (
          <div className={`space-y-4 ${viewMode === 'cards' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : ''}`}>
            {regularNotifications.map((notification) => (
              viewMode === 'cards' ? (
                <ReminderCard
                  key={notification.id}
                  notification={notification}
                  onDismiss={handleDelete}
                  onAction={handleAction}
                  onSnooze={handleSnooze}
                />
              ) : (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onAction={handleAction}
                />
              )
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No notifications found</p>
            <p className="text-sm text-gray-500">
              {filter === 'all' 
                ? "You're all caught up! We'll notify you about appointments and health updates."
                : `No ${filter.replace('-', ' ')} notifications at the moment.`
              }
            </p>
          </div>
        )}
      </DashboardWidget>
    </div>
  );
}