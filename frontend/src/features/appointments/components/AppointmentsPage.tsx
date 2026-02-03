import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Plus,
  Search,
  ChevronRight,
  Activity
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

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'today'>('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  const getFilteredAppointments = () => {
    let filtered = appointments;

    // Apply status filter
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

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.doctorSpecialty?.toLowerCase().includes(searchTerm.toLowerCase())
      );
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

  if (loading) {
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
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="min-w-[120px]"
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
            appointments.length === 0 
              ? "You haven't booked any appointments yet."
              : "No appointments match your current filters."
          }
          onAction={
            appointments.length === 0 ? () => {
              window.location.href = '/app/appointments/book';
            } : undefined
          }
        />
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {appointment.doctorName || 'Dr. Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {appointment.doctorSpecialty || 'General Practice'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        <span>{getDateLabel(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                        <strong>Notes:</strong> {appointment.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
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