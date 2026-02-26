import React from 'react';
import { 
  Calendar, 
  MessageCircle, 
  Bell, 
  Users, 
  FileText, 
  Search,
  Plus,
  Inbox
} from 'lucide-react';
import { clsx } from 'clsx';

interface EmptyStateProps {
  title?: string;
  message?: string;
  type?: 'appointments' | 'messages' | 'notifications' | 'patients' | 'documents' | 'search' | 'generic';
  onAction?: () => void;
  actionLabel?: string;
  className?: string;
  showIcon?: boolean;
  showAction?: boolean;
}

export type { EmptyStateProps };

const emptyStateConfigs = {
  appointments: {
    icon: Calendar,
    title: 'No Appointments',
    message: 'You don\'t have any appointments scheduled. Book your first appointment to get started.',
    actionLabel: 'Book Appointment',
    iconColor: 'text-blue-500'
  },
  messages: {
    icon: MessageCircle,
    title: 'No Messages',
    message: 'Your inbox is empty. Start a conversation with the AI assistant or check back later.',
    actionLabel: 'Start Chat',
    iconColor: 'text-green-500'
  },
  notifications: {
    icon: Bell,
    title: 'No Notifications',
    message: 'You\'re all caught up! No new notifications at this time.',
    actionLabel: 'Refresh',
    iconColor: 'text-yellow-500'
  },
  patients: {
    icon: Users,
    title: 'No Patients',
    message: 'You don\'t have any patients assigned yet. Patients will appear here once they book appointments.',
    actionLabel: 'View Schedule',
    iconColor: 'text-purple-500'
  },
  documents: {
    icon: FileText,
    title: 'No Documents',
    message: 'No documents have been uploaded yet. Add your first document to get started.',
    actionLabel: 'Upload Document',
    iconColor: 'text-indigo-500'
  },
  search: {
    icon: Search,
    title: 'No Results Found',
    message: 'We couldn\'t find anything matching your search. Try different keywords or check your spelling.',
    actionLabel: 'Clear Search',
    iconColor: 'text-gray-500'
  },
  generic: {
    icon: Inbox,
    title: 'Nothing Here Yet',
    message: 'This section is empty. Content will appear here once available.',
    actionLabel: 'Refresh',
    iconColor: 'text-gray-500'
  }
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  type = 'generic',
  onAction,
  actionLabel,
  className,
  showIcon = true,
  showAction = true
}) => {
  const config = emptyStateConfigs[type];
  const Icon = config.icon;

  return (
    <div 
      className={clsx(
        'flex flex-col items-center justify-center text-center p-8 space-y-4',
        className
      )}
      role="status"
      aria-label="Empty state"
    >
      {showIcon && (
        <div className={clsx('p-4 rounded-full bg-gray-100', config.iconColor)}>
          <Icon className="w-12 h-12" aria-hidden="true" />
        </div>
      )}
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-900">
          {title || config.title}
        </h3>
        <p className="text-gray-600 max-w-md">
          {message || config.message}
        </p>
      </div>

      {showAction && onAction && (
        <button
          onClick={onAction}
          className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-6"
          aria-label={actionLabel || config.actionLabel}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          <span>{actionLabel || config.actionLabel}</span>
        </button>
      )}
    </div>
  );
};

// Specialized empty state components
export const EmptyAppointments: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState {...props} type="appointments" />
);

export const EmptyMessages: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState {...props} type="messages" />
);

export const EmptyNotifications: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState {...props} type="notifications" />
);

export const EmptyPatients: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState {...props} type="patients" />
);

export const EmptySearchResults: React.FC<Omit<EmptyStateProps, 'type'>> = (props) => (
  <EmptyState {...props} type="search" />
);

// Compact empty state for smaller spaces
export const CompactEmptyState: React.FC<{
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}> = ({ message, actionLabel, onAction, className }) => (
  <div 
    className={clsx(
      'text-center py-8 px-4',
      className
    )}
    role="status"
    aria-label="Empty state"
  >
    <p className="text-gray-500 text-sm mb-4">{message}</p>
    {onAction && actionLabel && (
      <button
        onClick={onAction}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2 py-1"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

// Empty state for data tables
export const EmptyTable: React.FC<{
  columns: number;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}> = ({ 
  columns, 
  message = 'No data available', 
  actionLabel, 
  onAction 
}) => (
  <tr>
    <td colSpan={columns} className="px-6 py-12">
      <CompactEmptyState
        message={message}
        actionLabel={actionLabel}
        onAction={onAction}
      />
    </td>
  </tr>
);