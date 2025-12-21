import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Home, 
  Calendar, 
  MessageCircle, 
  Users, 
  Settings, 
  Activity,
  Stethoscope,
  User,
  Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { clsx } from 'clsx';

interface MobileNavProps {
  unreadCount?: number;
}

const patientNavItems = [
  { to: '/app/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/app/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/app/ai-chat', icon: MessageCircle, label: 'AI Assistant' },
  { to: '/app/symptom-checker', icon: Activity, label: 'Symptom Checker' },
  { to: '/app/notifications', icon: Bell, label: 'Notifications' },
  { to: '/app/profile', icon: User, label: 'Profile' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

const doctorNavItems = [
  { to: '/app/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/app/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/app/patients', icon: Users, label: 'Patients' },
  { to: '/app/ai-chat', icon: MessageCircle, label: 'AI Assistant' },
  { to: '/app/symptom-checker', icon: Activity, label: 'Symptom Checker' },
  { to: '/app/notifications', icon: Bell, label: 'Notifications' },
  { to: '/app/profile', icon: User, label: 'Profile' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

const adminNavItems = [
  { to: '/app/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/app/users', icon: Users, label: 'Users' },
  { to: '/app/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/app/analytics', icon: Activity, label: 'Analytics' },
  { to: '/app/notifications', icon: Bell, label: 'Notifications' },
  { to: '/app/profile', icon: User, label: 'Profile' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
];

export const MobileNav: React.FC<MobileNavProps> = ({ unreadCount = 0 }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const getNavItems = () => {
    switch (user?.role) {
      case 'doctor': return doctorNavItems;
      case 'admin': return adminNavItems;
      default: return patientNavItems;
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
        >
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Menu Panel */}
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Info */}
            {user && (
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Links */}
            <nav className="p-4 space-y-1" role="navigation">
              {getNavItems().map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )
                  }
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" />
                    {label === 'Notifications' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Emergency Contact */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-red-50">
              <div className="text-center">
                <p className="text-xs text-red-600 font-medium mb-1">Emergency?</p>
                <a 
                  href="tel:911" 
                  className="text-sm font-bold text-red-700 hover:text-red-800"
                  onClick={() => setIsOpen(false)}
                >
                  Call 911
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};