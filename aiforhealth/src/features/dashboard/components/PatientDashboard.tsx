import { useState, useEffect } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { dashboardService } from '@/services/dashboardService';
import type { Appointment, Medication, HealthReminder } from '@/types/dashboard';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

export function PatientDashboard() {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [healthReminders, setHealthReminders] = useState<HealthReminder[]>([]);
  const [appointmentHistory, setAppointmentHistory] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [appointments, meds, reminders, history] = await Promise.all([
          dashboardService.getUpcomingAppointments(),
          dashboardService.getMedications(),
          dashboardService.getHealthReminders(),
          dashboardService.getAppointmentHistory()
        ]);
        
        setUpcomingAppointments(appointments);
        setMedications(meds);
        setHealthReminders(reminders);
        setAppointmentHistory(history);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      await dashboardService.markReminderComplete(reminderId);
      setHealthReminders(prev => 
        prev.map(reminder => 
          reminder.id === reminderId 
            ? { ...reminder, completed: true }
            : reminder
        )
      );
    } catch (error) {
      console.error('Error completing reminder:', error);
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
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'rescheduled': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600"></div>
      </div>
    );
  }

  const pendingReminders = healthReminders.filter(r => !r.completed);
  const nextAppointment = upcomingAppointments[0];
  const nextMedication = medications.find(med => new Date(med.nextDose) > new Date());

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-medical-600 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-medical-100">
          Here's your health overview for today
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Next Appointment"
          value={nextAppointment ? getDateLabel(nextAppointment.date) : 'None'}
          subtitle={nextAppointment ? nextAppointment.time : 'No upcoming appointments'}
          icon={<Calendar className="h-6 w-6" />}
          variant="primary"
        />
        
        <StatCard
          title="Active Medications"
          value={medications.length}
          subtitle={nextMedication ? `Next: ${format(parseISO(nextMedication.nextDose), 'h:mm a')}` : 'All up to date'}
          icon={<Pill className="h-6 w-6" />}
          variant="success"
        />
        
        <StatCard
          title="Pending Reminders"
          value={pendingReminders.length}
          subtitle={pendingReminders.length > 0 ? 'Action needed' : 'All caught up'}
          icon={<Bell className="h-6 w-6" />}
          variant={pendingReminders.length > 0 ? 'warning' : 'success'}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
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
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-medical-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{appointment.doctorName}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{appointment.doctorSpecialty}</p>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {getDateLabel(appointment.date)} at {appointment.time}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {appointment.location}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <Link to="/app/appointments/book">
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Book New Appointment
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No upcoming appointments</p>
                <Link to="/app/appointments/book">
                  <Button variant="primary">
                    <Plus className="mr-2 h-4 w-4" />
                    Book Your First Appointment
                  </Button>
                </Link>
              </div>
            )}
          </DashboardWidget>

          {/* Appointment History */}
          <DashboardWidget
            title="Recent Appointment History"
            icon={<Clock className="h-5 w-5" />}
            action={
              <Link to="/app/appointments/history">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            }
          >
            {appointmentHistory.length > 0 ? (
              <div className="space-y-3">
                {appointmentHistory.slice(0, 3).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{appointment.doctorName}</p>
                        <p className="text-sm text-gray-600">{appointment.doctorSpecialty}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {format(parseISO(appointment.date), 'MMM d, yyyy')}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No appointment history yet</p>
            )}
          </DashboardWidget>
        </div>

        {/* Right Column */}
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
            <div className="space-y-3">
              {pendingReminders.slice(0, 4).map((reminder) => (
                <div key={reminder.id} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                  <div className={`p-1 rounded-full ${getPriorityColor(reminder.priority)}`}>
                    <Bell className="h-3 w-3" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 text-sm">{reminder.title}</h5>
                    <p className="text-xs text-gray-600 mb-2">{reminder.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {format(parseISO(reminder.dueDate), 'MMM d, h:mm a')}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCompleteReminder(reminder.id)}
                        className="text-xs px-2 py-1 h-auto"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Done
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {pendingReminders.length === 0 && (
                <div className="text-center py-4">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">All caught up!</p>
                </div>
              )}
            </div>
          </DashboardWidget>

          {/* Medication Reminders */}
          <DashboardWidget
            title="Medication Schedule"
            icon={<Pill className="h-5 w-5" />}
            variant="success"
          >
            <div className="space-y-3">
              {medications.slice(0, 3).map((medication) => (
                <div key={medication.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Pill className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{medication.name}</p>
                      <p className="text-xs text-gray-600">{medication.dosage} - {medication.frequency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-900">
                      Next: {format(parseISO(medication.nextDose), 'h:mm a')}
                    </p>
                    <div className="w-16 bg-gray-200 rounded-full h-1 mt-1">
                      <div 
                        className="bg-green-500 h-1 rounded-full" 
                        style={{ width: `${(medication.remainingDoses / medication.totalDoses) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              {medications.length === 0 && (
                <p className="text-sm text-gray-600 text-center py-4">No medications scheduled</p>
              )}
            </div>
          </DashboardWidget>

          {/* Quick Actions */}
          <DashboardWidget
            title="Quick Actions"
            icon={<TrendingUp className="h-5 w-5" />}
          >
            <div className="space-y-3">
              <Link to="/app/ai-chat" className="block">
                <Button variant="primary" className="w-full justify-start">
                  <MessageCircle className="mr-3 h-4 w-4" />
                  Ask AI Assistant
                </Button>
              </Link>
              <Link to="/app/appointments/book" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-3 h-4 w-4" />
                  Book Appointment
                </Button>
              </Link>
              <Link to="/app/health-records" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="mr-3 h-4 w-4" />
                  View Health Records
                </Button>
              </Link>
            </div>
          </DashboardWidget>
        </div>
      </div>
    </div>
  );
}