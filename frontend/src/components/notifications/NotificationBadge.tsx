import { Bell } from 'lucide-react';

interface NotificationBadgeProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

export function NotificationBadge({ count, onClick, className = '' }: NotificationBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-gray-900 transition-colors ${className}`}
      aria-label={`Notifications (${count} unread)`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}