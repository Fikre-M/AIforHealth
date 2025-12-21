import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  MessageCircle, 
  Users, 
  Settings, 
  Activity,
  Stethoscope 
} from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { clsx } from 'clsx';

const patientNavItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/ai-chat', icon: MessageCircle, label: 'AI Assistant' },
  { to: '/profile', icon: Settings, label: 'Profile' },
];

const doctorNavItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/ai-chat', icon: MessageCircle, label: 'AI Assistant' },
  { to: '/profile', icon: Settings, label: 'Profile' },
];

const adminNavItems = [
  { to: '/dashboard', icon: Home, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/doctors', icon: Stethoscope, label: 'Doctors' },
  { to: '/analytics', icon: Activity, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { user } = useAuth();
  
  const getNavItems = () => {
    switch (user?.role) {
      case 'doctor': return doctorNavItems;
      case 'admin': return adminNavItems;
      default: return patientNavItems;
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {getNavItems().map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-medical-50 text-medical-700 border-r-2 border-medical-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}