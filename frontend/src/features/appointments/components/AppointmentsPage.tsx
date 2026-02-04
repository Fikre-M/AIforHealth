import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus,
  Search,
  ChevronRight,
  Activity,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { appointmentService } from '@/services/appointmentService';
import type { Appointment as DashboardAppointment } from '@/types/dashboard';
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';

// Simple debounce implementation
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | null = null;
  
  const debounced = ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T & { cancel: () => void };
  
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  return debounced;
}

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'today'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getAppointments();
      
      // Transform backend appointments to dashboard appointments
      const dashboardAppointments: DashboardAppointment[] = data.map((apt: any) => ({
        id: apt.id || apt._id,
        doctorName: apt.doctor?.name || 'Dr. Unknown',
        doctorSpecialty: apt.doctor?.specialty || 'General Practice',
        date: apt.appointmentDate ? apt.appointmentDate.split('T')[0] : apt.date,
        time: apt.appointmentDate ? format(parseISO(apt.appointmentDate), 'HH:mm') : apt.time,
        type: apt.type as any,
        status: apt.status as any,
        location: 'Medical Center',
        notes: apt.notes || apt.reason,
        doctorAvatar: apt.doctor?.avatar
      }));
      
      setAppointments(dashboardAppointments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setHasSearched(false);
        await loadAppointments();
        return;
      }

      try {
        setSearchLoading(true);
        setHasSearched(true);
        const searchResult = await appointmentService.searchAppointments({
          query: query.trim(),
          limit: 50
        });
        
        // Transform search results
        const dashboardAppointments: DashboardAppointment[] = searchResult.appointments.map((apt: any) => ({
          id: apt.id || apt._id,
          doctorName: apt.doctor?.name || 'Dr. Unknown',
          doctorSpecialty: apt.doctor?.specialty || 'General Practice',
          date: apt.appointmentDate ? apt.appointmentDate.split('T')[0] : apt.date,
          time: apt.appointmentDate ? format(parseISO(apt.appointmentDate), 'HH:mm') : apt.time,
          type: apt.type as any,
          status: apt.status as any,
          location: 'Medical Center',
          notes: apt.notes || apt.reason,
          doctorAvatar: apt.doctor?.avatar
        }));
        
        setAppointments(dashboardAppointments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  const clearSearch = () => {
    setSearchTerm('');
    setHasSearched(false);
    loadAppointments();
  };

  const getFilteredAppointments = () => {
    let filtered = appointments;

    // Apply status filter only if not searching
    if (!hasSearched) {
      switch (filter) {
        case 'upcoming':
          filtered = filtered.filter(apt => !isPast(parseISO(apt.date + 'T' + apt.time)) && apt.status !== 'cancelled');
          break;
        case 'past':
          filtered = filtered.filter(apt => isPast(parseISO(apt.date + 'T' + apt.time)) || apt.status === 'completed');
          break;
        case 'today':
          filtered = filtered.filter(apt => isToday(parseISO(apt.date)));
          break;
        default:
          // 'all' - no additional filtering
          break;
      }
    }

    return filtered.sort((a, b) => 
      new Date(b.date + 'T' + b.time).getTime() - new Date(a.date + 'T' + a.time).getTime()
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'missed':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const filteredAppointments = getFilteredAppointments();

  if (loading && !searchLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <LoadingSkeleton className="h-8 w-48" />
          <LoadingSkeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <LoadingSkeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load appointments"
        message={error}
        onRetry={loadAppointments}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            My Appointments
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your healthcare appointments
          </p>
        </div>
        <Link to="/app/appointments/book">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Book Appointment
          </Button>
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search appointments, doctors, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-medical-600"></div>
              </div>
            )}
          </div>
          {hasSearched && (
            <p className="text-sm text-gray-600 mt-2">
              {filteredAppointments.length} result{filteredAppointments.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="min-w-[120px]"
            disabled={hasSearched}
            options={[
              { value: 'all', label: 'All' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'today', label: 'Today' },
              { value: 'past', label: 'Past' }
            ]}
          />
        </div>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <EmptyState
          type="appointments"
          title="No appointments found"
          message={
            hasSearched
              ? `No appointments match "${searchTerm}"`
              : appointments.length === 0 
              ? "You haven't booked any appointments yet."
              : "No appointments match your current filters."
          }
          onAction={
            hasSearched ? clearSearch : 
            appointments.length === 0 ? () => {
              window.location.href = '/app/appointments/book';
            } : undefined
          }
          actionLabel={hasSearched ? "Clear search" : "Book Appointment"}
        />
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow" overflow="hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {appointment.doctorName || 'Dr. Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {appointment.doctorSpecialty || 'General Practice'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{getDateLabel(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/app/appointments/book">
            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-3 h-4 w-4" />
              Book New Appointment
            </Button>
          </Link>
          <Link to="/app/ai-chat">
            <Button variant="outline" className="w-full justify-start">
              <User className="mr-3 h-4 w-4" />
              Ask AI Assistant
            </Button>
          </Link>
          <Link to="/app/symptom-checker">
            <Button variant="outline" className="w-full justify-start">
              <Activity className="mr-3 h-4 w-4" />
              Check Symptoms
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}