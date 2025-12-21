import { Link } from 'react-router-dom';
import { Heart, Shield, Zap, Users, Calendar, MessageCircle } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-medical-600" />
              <span className="text-2xl font-bold text-gray-900">AIforHealth</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                to="/login"
                className="bg-medical-600 hover:bg-medical-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Next-Generation
            <span className="text-medical-600"> AI Healthcare</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the future of healthcare with our AI-powered platform. 
            Smart appointments, instant health guidance, and personalized care - all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-medical-600 hover:bg-medical-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
            >
              Start Your Health Journey
            </Link>
            <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose AIforHealth?
            </h2>
            <p className="text-xl text-gray-600">
              Advanced healthcare technology designed for modern patients and providers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-medical-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600">
                Get instant health guidance and symptom analysis with our advanced AI assistant
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-medical-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
              <p className="text-gray-600">
                Book appointments effortlessly with our intelligent scheduling system
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-medical-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
              <p className="text-gray-600">
                Your health data is protected with enterprise-grade security and privacy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-medical-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-medical-100 mb-8">
            Join thousands of patients and healthcare providers already using AIforHealth
          </p>
          <Link
            to="/login"
            className="bg-white hover:bg-gray-100 text-medical-600 px-8 py-3 rounded-lg text-lg font-medium"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Heart className="h-6 w-6 text-medical-400" />
              <span className="text-xl font-bold">AIforHealth</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2024 AIforHealth. Built for healthcare innovation.
            </div>
          </div>
        </div>
      </footer>

      {/* Medical Disclaimer */}
      <div className="bg-yellow-50 border-t border-yellow-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-yellow-800 text-center">
            <strong>Medical Disclaimer:</strong> This platform provides general health information only. 
            Always consult qualified healthcare providers for medical advice, diagnosis, or treatment.
          </p>
        </div>
      </div>
    </div>
  );
}