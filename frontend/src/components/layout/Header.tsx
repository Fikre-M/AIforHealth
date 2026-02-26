import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Bell } from 'lucide-react';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { ProfileDropdown } from '@/components/profile/ProfileDropdown';
import { MobileNav } from './MobileNav';
import { notificationService } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
    // Return undefined for the else case
    return undefined;
  }, [user]);

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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link 
              to={user ? "/app/dashboard" : "/"} 
              className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md p-1"
              aria-label="AIforHealth - Go to homepage"
            >
              <Heart className="w-8 h-8 text-red-500" aria-hidden="true" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                <span className="text-blue-600">AI</span>
                <span className="text-gray-900">for</span>
                <span className="text-red-500">Health</span>
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Main navigation">
              <Link 
                to="/app/dashboard" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Dashboard
              </Link>
              <Link 
                to="/app/appointments" 
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Appointments
              </Link>
              {user.role === 'doctor' && (
                <Link 
                  to="/app/patients" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Patients
                </Link>
              )}
              {user.role === 'admin' && (
                <>
                  <Link 
                    to="/app/users" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Users
                  </Link>
                  <Link 
                    to="/app/analytics" 
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Analytics
                  </Link>
                </>
              )}
            </nav>
          )}
          
          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Emergency Button - Always Visible */}
                <a
                  href="tel:911"
                  className="hidden sm:flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Emergency - Call 911"
                >
                  <Bell className="w-3 h-3 mr-1" aria-hidden="true" />
                  Emergency
                </a>

                {/* Desktop Notifications */}
                <div className="hidden md:block relative">
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
                
                {/* Desktop Profile Dropdown */}
                <div className="hidden md:block">
                  <ProfileDropdown />
                </div>

                {/* Mobile Navigation */}
                <MobileNav unreadCount={unreadCount} />
              </>
            ) : (
              /* Auth Links for Non-Authenticated Users */
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="bg-gray-800 text-white border border-gray-800 hover:bg-gray-900 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}