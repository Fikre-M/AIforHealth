import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';

export function DoctorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-600">Manage your patients and appointments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Patients</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <Users className="h-8 w-8 text-medical-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Appointments</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Wait Time</p>
              <p className="text-2xl font-bold text-gray-900">15m</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <p className="text-2xl font-bold text-gray-900">4.8</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h2>
        <div className="space-y-3">
          {[
            { time: '09:00 AM', patient: 'John Doe', type: 'Consultation' },
            { time: '10:00 AM', patient: 'Jane Smith', type: 'Follow-up' },
            { time: '11:00 AM', patient: 'Mike Johnson', type: 'Check-up' },
          ].map((apt, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center">
                  <span className="text-medical-600 font-semibold">{apt.patient[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{apt.patient}</p>
                  <p className="text-sm text-gray-600">{apt.type}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{apt.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}