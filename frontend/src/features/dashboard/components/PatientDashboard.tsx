import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MessageCircle, 
  Activity, 
  Clock, 
  Pill,
  Bell,
  Heart,
  TrendingUp,
  Plus,
  CheckCircle,
  User,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardSkeleton, AppointmentSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyAppointments, EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useConcurrentOperations } from '@/hooks/useLoadingState';
import { useUIState } from '@/hooks/useUIState';
import { dashboardService } from '@/services/dashboardService';
import type { Appointment, Medication, HealthReminder } from '@/types/dashboard';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

export function PatientDashboard() {
  const { user } = useAuth();
  const { executeOperation, loadingStates } = useConcurrentOperations();
  
  // Individual UI states for different sections
  const appointmentsState = useUIState<Appointment[]>({
    emptyCheck: (data) => !data || data.length === 0
  });
  
  const medicationsState = useUIState<Medication[]>({
    emptyCheck: (data) => !data || data.length === 0
  });
  
  const remindersState = useUIState<HealthReminder[]>({
    emptyCheck: (data) => !data || data.length === 0
  });
  
  const historyState = useUIState<Appointment[]>({
    emptyCheck: (data) => !data || data.length === 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Load all data concurrently with proper error handling
    await Promise.allSettled([
      appointmentsState.executeAsync(() => dashboardService.getUpcomingAppointments()),
      medicationsState.executeAsync(() => dashboardService.getMedications()),
      remindersState.executeAsync(() => dashboardService.getHealthReminders()),
      historyState.executeAsync(() => dashboardService.getAppointmentHistory())
    ]);
  };

  const handleCompleteReminder = async (reminderId: string) => {
    const result = await executeOperation('completeReminder', async () => {
      await dashboardService.markReminderComplete(reminderId);
      return reminderId;
    });

    if (result) {
      // Update local state optimistically
      const updatedReminders = remindersState.data?.map(reminder => 
        reminder.id === reminderId 
          ? { ...reminder, completed: true }
          : reminder
      ) || [];
      remindersState.setData(updatedReminders);
    }
  };

  const handleRetrySection = (section: 'appointments' | 'medications' | 'reminders' | 'history') => {
    switch (section) {
      case 'appointments':
        appointmentsState.retry();
        break;
      case 'medications':
        medicationsState.retry();
        break;
      case 'reminders':
        remindersState.retry();
        break;
      case 'history':
        historyState.retry();
        break;
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      case 'low': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'completed': return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'cancelled': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'rescheduled': return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  // Show loading skeleton for initial load
  if (appointmentsState.isLoading && !appointmentsState.data && !medicationsState.data) {
    return <DashboardSkeleton />;
  }

  const pendingReminders = remindersState.data?.filter(r => !r.completed) || [];
  const nextAppointment = appointmentsState.data?.[0];
  const nextMedication = medicationsState.data?.find(med => new Date(med.nextDose) > new Date());

  return (
    <div className="space-y-8" role="main" aria-label="Patient Dashboard">
      {/* Welcome Header with consistent gradient and typography */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-blue-100 dark:text-blue-200 text-base">
          Here's your health overview for today
        </p>
      </div>

      {/* Quick Stats with consistent spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Next Appointment"
          value={nextAppointment ? getDateLabel(nextAppointment.date) : 'None'}
          subtitle={nextAppointment ? nextAppointment.time : 'No upcoming appointments'}
          icon={<Calendar className="h-6 w-6" />}
          variant="primary"
          isLoading={appointmentsState.isLoading}
        />
        
        <StatCard
          title="Active Medications"
          value={medicationsState.data?.length || 0}
          subtitle={nextMedication ? `Next: ${format(parseISO(nextMedication.nextDose), 'h:mm a')}` : 'All up to date'}
          icon={<Pill className="h-6 w-6" />}
          variant="success"
          isLoading={medicationsState.isLoading}
        />
        
        <StatCard
          title="Pending Reminders"
          value={pendingReminders.length}
          subtitle={pendingReminders.length > 0 ? 'Action needed' : 'All caught up'}
          icon={<Bell className="h-6 w-6" />}
          variant={pendingReminders.length > 0 ? 'warning' : 'success'}
          isLoading={remindersState.isLoading}
        />
        
        <StatCard
          title="Health Score"
          value="85"
          subtitle="Good health status"
          icon={<Activity className="h-6 w-6" />}
          variant="success"
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Main Content Grid with consistent spacing and better proportions */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          <DashboardWidget
            title="Upcoming Appointments"
            icon={<Calendar className="h-5 w-5" />}
            variant="primary"
            action={
              <Link to="/app/appointments">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            }
          >
            <div className="max-h-[350px] overflow-y-auto">
              {appointmentsState.isLoading ? (
                <AppointmentSkeleton />
              ) : appointmentsState.hasError() ? (
                <ErrorState
                  title="Failed to load appointments"
                  message={appointmentsState.error?.message}
                  type="server"
                  onRetry={() => handleRetrySection('appointments')}
                  className="py-8"
                  showIcon={false}
                />
              ) : appointmentsState.isEmpty ? (
                <EmptyAppointments
                  onAction={() => window.location.href = '/app/appointments/book'}
                  className="py-8"
                />
              ) : (
                <div className="space-y-3 pb-4">
                  {appointmentsState.data?.slice(0, 4).map((appointment) => (
                    <div key={appointment.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
                            {appointment.doctorName}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">
                          {appointment.doctorSpecialty}
                        </p>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 space-x-3">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{getDateLabel(appointment.date)} at {appointment.time}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{appointment.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Link to="/app/appointments/book" className="block mt-3">
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Book New Appointment
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </DashboardWidget>

          {/* Appointment History */}
          <DashboardWidget
            title="Recent Appointment History"
            icon={<Clock className="h-5 w-5" />}
            action={
              <Link to="/app/appointments">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            }
          >
            <div className="max-h-[300px] overflow-y-auto">
              {historyState.isLoading ? (
                <AppointmentSkeleton />
              ) : historyState.hasError() ? (
                <ErrorState
                  title="Failed to load history"
                  message={historyState.error?.message}
                  type="server"
                  onRetry={() => handleRetrySection('history')}
                  className="py-8"
                  showIcon={false}
                />
              ) : historyState.isEmpty ? (
                <EmptyState
                  type="generic"
                  title="No History"
                  message="No appointment history available yet"
                  showAction={false}
                  className="py-8"
                />
              ) : (
                <div className="space-y-2 pb-4">
                  {historyState.data?.slice(0, 4).map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                            {appointment.doctorName}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                            {appointment.doctorSpecialty}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {getDateLabel(appointment.date)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {appointment.time}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DashboardWidget>
        </div>


        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* AI Health Reminders */}
          <DashboardWidget
            title="AI Health Reminders"
            icon={<Bell className="h-5 w-5" />}
            variant="warning"
            action={
              <Link to="/app/ai-chat">
                <Button variant="ghost" size="sm">
                  <MessageCircle className="mr-1 h-4 w-4" />
                  AI Assistant
                </Button>
              </Link>
            }
          >
            <div className="max-h-[280px] overflow-y-auto">
              {remindersState.isLoading ? (
                <div className="space-y-3 pb-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : remindersState.hasError() ? (
                <ErrorState
                  title="Failed to load reminders"
                  message={remindersState.error?.message}
                  type="server"
                  onRetry={() => handleRetrySection('reminders')}
                  className="py-8"
                  showIcon={false}
                />
              ) : (
                <div className="space-y-3 pb-4">
                  {pendingReminders.slice(0, 4).map((reminder) => (
                    <div key={reminder.id} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                      <div className={`p-1.5 rounded-full flex-shrink-0 ${getPriorityColor(reminder.priority)}`}>
                        <Bell className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1 truncate">{reminder.title}</h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{reminder.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 dark:text-gray-500">
                            {format(parseISO(reminder.dueDate), 'MMM d, h:mm a')}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCompleteReminder(reminder.id)}
                            disabled={loadingStates.completeReminder}
                            className="text-xs px-2 py-1 h-auto flex-shrink-0"
                            aria-label={`Mark "${reminder.title}" as complete`}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {loadingStates.completeReminder ? 'Completing...' : 'Done'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingReminders.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">All caught up!</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">No pending reminders</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DashboardWidget>

          {/* Medication Schedule */}
          <DashboardWidget
            title="Medication Schedule"
            icon={<Pill className="h-5 w-5" />}
            variant="success"
          >
            <div className="max-h-[250px] overflow-y-auto">
              {medicationsState.isLoading ? (
                <div className="space-y-3 pb-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex-shrink-0"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                          </div>
                        </div>
                        <div className="w-20 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : medicationsState.hasError() ? (
                <ErrorState
                  title="Failed to load medications"
                  message={medicationsState.error?.message}
                  type="server"
                  onRetry={() => handleRetrySection('medications')}
                  className="py-8"
                  showIcon={false}
                />
              ) : medicationsState.isEmpty ? (
                <EmptyState
                  type="generic"
                  title="No Medications"
                  message="No medications scheduled"
                  showAction={false}
                  className="py-8"
                />
              ) : (
                <div className="space-y-3 pb-4">
                  {medicationsState.data?.slice(0, 3).map((medication) => (
                    <div key={medication.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700 transition-colors">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                          <Pill className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1 truncate">{medication.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{medication.dosage} - {medication.frequency}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          Next: {format(parseISO(medication.nextDose), 'h:mm a')}
                        </p>
                        <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full transition-all duration-300" 
                            style={{ width: `${(medication.remainingDoses / medication.totalDoses) * 100}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {medication.remainingDoses}/{medication.totalDoses} left
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DashboardWidget>

          {/* Quick Actions */}
          <DashboardWidget
            title="Quick Actions"
            icon={<TrendingUp className="h-5 w-5" />}
          >
            <div className="space-y-3">
              <Link to="/app/symptom-checker" className="block">
                <Button variant="primary" className="w-full justify-start text-left">
                  <Activity className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">Symptom Checker</span>
                </Button>
              </Link>
              <Link to="/app/ai-chat" className="block">
                <Button variant="outline" className="w-full justify-start text-left">
                  <MessageCircle className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">Ask AI Assistant</span>
                </Button>
              </Link>
              <Link to="/app/appointments/book" className="block">
                <Button variant="outline" className="w-full justify-start text-left">
                  <Calendar className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">Book Appointment</span>
                </Button>
              </Link>
              <Link to="/app/health-records" className="block">
                <Button variant="outline" className="w-full justify-start text-left">
                  <Heart className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="truncate">View Health Records</span>
                </Button>
              </Link>
            </div>
          </DashboardWidget>
        </div>
      </div>
    </div>
  );
}