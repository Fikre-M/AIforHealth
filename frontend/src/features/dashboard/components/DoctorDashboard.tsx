import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  Clock, 
  TrendingUp, 
  MessageCircle,
  Bell,
  Activity,
  Stethoscope,
  Plus,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DashboardWidget } from '@/components/dashboard/DashboardWidget';
import { StatCard } from '@/components/dashboard/StatCard';
import { AppointmentCard } from '@/components/doctor/AppointmentCard';
import { PatientOverviewCard } from '@/components/doctor/PatientOverviewCard';
import { AppointmentRequestCard } from '@/components/doctor/AppointmentRequestCard';
import { useAuth } from '@/hooks/useAuth';
import { doctorService } from '@/services/doctorService';
import { AppointmentStatus } from '@/types/appointment';
import type { DoctorAppointment, Patient, AppointmentRequest, PatientSummary } from '@/types/doctor';

export function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todayAppointments, setTodayAppointments] = useState<DoctorAppointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointmentRequests, setAppointmentRequests] = useState<AppointmentRequest[]>([]);
  const [patientSummaries, setPatientSummaries] = useState<PatientSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'scheduled' | 'completed'>('all');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [appointments, patientsData, requests, summaries] = await Promise.all([
          doctorService.getTodayAppointments(),
          doctorService.getPatients(),
          doctorService.getAppointmentRequests(),
          doctorService.getPatientSummaries()
        ]);
        
        setTodayAppointments(appointments);
        setPatients(Array.isArray(patientsData) ? patientsData : patientsData.patients || []);
        setAppointmentRequests(Array.isArray(requests) ? requests : requests.requests || []);
        setPatientSummaries(Array.isArray(summaries) ? summaries : summaries.summaries || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleAppointmentStatusChange = async (appointmentId: string, status: string) => {
    try {
      // Convert string to AppointmentStatus enum
      const appointmentStatus = status as AppointmentStatus;
      await doctorService.updateAppointmentStatus(appointmentId, appointmentStatus);
      setTodayAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? { ...apt, status: status as DoctorAppointment['status'] } : apt
        )
      );
    } catch (error) {
      console.error('Error updating appointment status:', error);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      // For demo purposes, use current date and time
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toTimeString().slice(0, 5);
      
      await doctorService.approveAppointmentRequest(requestId, { date, time });
      setAppointmentRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'approved' } : req
        )
      );
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await doctorService.rejectAppointmentRequest(requestId, 'Request rejected by doctor');
      setAppointmentRequests(prev => 
        prev.map(req => 
          req.id === requestId ? { ...req, status: 'rejected' } : req
        )
      );
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleViewPatientDetails = (patientId: string) => {
    // In a real app, this would navigate to patient details page
    console.log('View patient details:', patientId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-600"></div>
      </div>
    );
  }

  const filteredAppointments = todayAppointments.filter(apt => {
    if (selectedFilter === 'all') return true;
    return apt.status === selectedFilter;
  });

  const completedAppointments = todayAppointments.filter(apt => apt.status === 'completed').length;
  const scheduledAppointments = todayAppointments.filter(apt => apt.status === 'scheduled').length;
  const pendingRequests = appointmentRequests.filter(req => req.status === 'pending').length;
  const totalPatients = patients.length;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-medical-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Good morning, Dr. {user?.name?.split(' ').pop()}! 👨‍⚕️
            </h1>
            <p className="text-medical-100">
              You have {scheduledAppointments} appointments scheduled for today
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{new Date().getDate()}</div>
            <div className="text-medical-100">
              {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats with consistent spacing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Appointments"
          value={todayAppointments.length}
          subtitle={`${scheduledAppointments} scheduled, ${completedAppointments} completed`}
          icon={<Calendar className="h-6 w-6" />}
          variant="primary"
        />
        
        <StatCard
          title="Total Patients"
          value={totalPatients}
          subtitle="Active patient roster"
          icon={<Users className="h-6 w-6" />}
          variant="success"
        />
        
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          subtitle={pendingRequests > 0 ? 'Require attention' : 'All caught up'}
          icon={<Bell className="h-6 w-6" />}
          variant={pendingRequests > 0 ? 'warning' : 'success'}
        />
        
        <StatCard
          title="Completion Rate"
          value={`${Math.round((completedAppointments / Math.max(todayAppointments.length, 1)) * 100)}%`}
          subtitle="Today's progress"
          icon={<TrendingUp className="h-6 w-6" />}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
      </div>

      {/* Main Content Grid - 2x2 layout for main cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Today's Appointments */}
        <DashboardWidget
          title="Today's Appointments"
          icon={<Calendar className="h-5 w-5" />}
          variant="primary"
          action={
            <div className="flex items-center space-x-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="all">All</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </select>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          }
        >
          <div className="max-h-[400px] overflow-y-auto">
            {filteredAppointments.length > 0 ? (
              <div className="space-y-3 pb-4">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onStatusChange={handleAppointmentStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {selectedFilter === 'all' ? 'No appointments today' : `No ${selectedFilter} appointments`}
                </p>
              </div>
            )}
          </div>
        </DashboardWidget>

        {/* Appointment Requests */}
        <DashboardWidget
          title="Appointment Requests"
          icon={<Bell className="h-5 w-5" />}
          variant="warning"
          action={
            <span className="text-sm text-gray-600">
              {pendingRequests} pending
            </span>
          }
        >
          <div className="max-h-[400px] overflow-y-auto">
            {appointmentRequests.length > 0 ? (
              <div className="space-y-3 pb-4">
                {appointmentRequests.slice(0, 4).map((request) => (
                  <AppointmentRequestCard
                    key={request.id}
                    request={request}
                    onApprove={handleApproveRequest}
                    onReject={handleRejectRequest}
                  />
                ))}
                {appointmentRequests.length > 4 && (
                  <div className="text-center pt-2">
                    <Button variant="outline" size="sm">
                      View All Requests ({appointmentRequests.length - 4} more)
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No pending appointment requests</p>
              </div>
            )}
          </div>
        </DashboardWidget>

        {/* Patient Overview */}
        <DashboardWidget
          title="Patient Overview"
          icon={<Users className="h-5 w-5" />}
          action={
            <Button variant="ghost" size="sm">
              View All
            </Button>
          }
        >
          <div className="max-h-[350px] overflow-y-auto">
            <div className="space-y-3 pb-4">
              {patients.slice(0, 4).map((patient) => {
                const summary = patientSummaries.find(s => s.patientId === patient.id);
                return (
                  <PatientOverviewCard
                    key={patient.id}
                    patient={patient}
                    summary={summary}
                    onViewDetails={handleViewPatientDetails}
                  />
                );
              })}
              {patients.length > 4 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm" className="w-full">
                    View All Patients ({patients.length - 4} more)
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DashboardWidget>

        {/* AI Patient Insights */}
        <DashboardWidget
          title="AI Patient Insights"
          icon={<Activity className="h-5 w-5" />}
          variant="primary"
        >
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-medical-50 to-blue-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <MessageCircle className="h-4 w-4 text-medical-600" />
                <span className="font-medium text-medical-800 text-sm">AI Summary</span>
              </div>
              <div className="space-y-1 text-xs text-medical-700">
                <p>• 3 patients show improved medication compliance</p>
                <p>• 1 patient requires follow-up for blood pressure</p>
                <p>• 2 patients due for routine screenings</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span className="font-medium text-yellow-800 text-sm">Priority Actions</span>
              </div>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Review Sarah Johnson's asthma symptoms</li>
                <li>• Schedule John Doe's HbA1c test</li>
              </ul>
            </div>
          </div>
        </DashboardWidget>
      </div>

      {/* Quick Actions - Full width at bottom */}
      <DashboardWidget
        title="Quick Actions"
        icon={<Stethoscope className="h-5 w-5" />}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Button 
            variant="primary" 
            className="justify-center"
            onClick={() => {
              // Navigate to add patient page
              navigate('/app/patients/new');
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
          <Button 
            variant="outline" 
            className="justify-center"
            onClick={() => {
              // Navigate to schedule appointment page
              navigate('/app/appointments/book');
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule
          </Button>
          <Button 
            variant="outline" 
            className="justify-center"
            onClick={() => {
              // Navigate to AI assistant
              navigate('/app/ai-chat');
            }}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            AI Assistant
          </Button>
          <Button 
            variant="outline" 
            className="justify-center"
            onClick={() => {
              // Navigate to analytics page
              navigate('/app/analytics');
            }}
          >
            <Activity className="mr-2 h-4 w-4" />
            Analytics
          </Button>
        </div>
      </DashboardWidget>
    </div>
  );
}