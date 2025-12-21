import { Calendar, MessageCircle, Activity, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PatientDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
        <p className="text-gray-600">Here's your health overview</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/appointments/book" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-medical-100 rounded-lg">
              <Calendar className="h-6 w-6 text-medical-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Book Appointment</h3>
              <p className="text-sm text-gray-600">Schedule with a doctor</p>
            </div>
          </div>
        </Link>

        <Link to="/ai-chat" className="card hover:shadow-md transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Assistant</h3>
              <p className="text-sm text-gray-600">Get health guidance</p>
            </div>
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Health Score</h3>
              <p className="text-sm text-gray-600">85/100 - Good</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
          <Link to="/appointments" className="text-medical-600 hover:text-medical-700 text-sm font-medium">
            View all
          </Link>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="p-2 bg-medical-100 rounded-lg">
              <Clock className="h-4 w-4 text-medical-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">Dr. Sarah Wilson</p>
              <p className="text-sm text-gray-600">Cardiology Consultation</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Jan 15, 2024</p>
              <p className="text-sm text-gray-600">10:00 AM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Health Tips */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Health Tip</h2>
        <div className="bg-medical-50 p-4 rounded-lg">
          <p className="text-medical-800">
            💧 Remember to stay hydrated! Aim for 8 glasses of water throughout the day to maintain optimal health.
          </p>
        </div>
      </div>
    </div>
  );
}