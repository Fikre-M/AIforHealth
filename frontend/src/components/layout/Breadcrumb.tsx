import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const routeLabels: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/dashboard': 'Dashboard',
  '/app/appointments': 'Appointments',
  '/app/appointments/book': 'Book Appointment',
  '/app/ai-chat': 'AI Assistant',
  '/app/symptom-checker': 'Symptom Checker',
  '/app/notifications': 'Notifications',
  '/app/profile': 'Profile',
  '/app/settings': 'Settings',
  '/app/patients': 'Patients',
  '/app/users': 'Users',
  '/app/doctors': 'Doctors',
  '/app/analytics': 'Analytics',
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  const location = useLocation();

  // Generate breadcrumb items from current path if not provided
  const breadcrumbItems = items || generateBreadcrumbItems(location.pathname);

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumb for single items
  }

  return (
    <nav 
      className={clsx('flex mb-6', className)} 
      aria-label="Breadcrumb"
      role="navigation"
    >
      <ol className="flex items-center space-x-2 text-sm">
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight 
                className="w-4 h-4 text-gray-400 mx-2" 
                aria-hidden="true" 
              />
            )}
            
            {index === 0 && (
              <Home 
                className="w-4 h-4 text-gray-400 mr-2" 
                aria-hidden="true" 
              />
            )}
            
            {item.current || !item.href ? (
              <span 
                className="text-gray-900 font-medium"
                aria-current={item.current ? 'page' : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  // Always start with home/dashboard
  items.push({
    label: 'Dashboard',
    href: '/app/dashboard'
  });

  // Build path incrementally
  let currentPath = '';
  for (let i = 0; i < pathSegments.length; i++) {
    currentPath += `/${pathSegments[i]}`;
    
    // Skip the first 'app' segment as it's covered by dashboard
    if (pathSegments[i] === 'app') continue;
    
    const label = routeLabels[currentPath] || pathSegments[i].charAt(0).toUpperCase() + pathSegments[i].slice(1);
    const isLast = i === pathSegments.length - 1;
    
    items.push({
      label,
      href: isLast ? undefined : currentPath,
      current: isLast
    });
  }

  return items;
}