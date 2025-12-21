import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { Breadcrumb } from './Breadcrumb';
import { SkipNav } from './SkipNav';
import { useAuth } from '@/hooks/useAuth';

export function Layout() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <SkipNav />
        <Header />
        <main 
          id="main-content"
          className="flex-1"
          role="main"
          aria-label="Main content"
        >
          <Outlet />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SkipNav />
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main 
          id="main-content"
          className="flex-1 overflow-y-auto focus:outline-none" 
          role="main"
          aria-label="Main content"
          tabIndex={-1}
        >
          <div className="p-4 sm:p-6 lg:p-8">
            <Breadcrumb />
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}