import { Link } from 'react-router-dom';
import { 
  Heart, 
  Calendar, 
  MessageCircle, 
  Bell,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { Container } from '@/components/ui/Container';
import { DemoModal } from '@/components/modals/DemoModal';
import { useState } from 'react';

export function LandingPage() {
  const [demoModal, setDemoModal] = useState<{ isOpen: boolean; type: 'watch' | 'schedule' }>({
    isOpen: false,
    type: 'watch'
  });

  const openDemoModal = (type: 'watch' | 'schedule') => {
    setDemoModal({ isOpen: true, type });
  };

  const closeDemoModal = () => {
    setDemoModal({ isOpen: false, type: 'watch' });
  };
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <Container>
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-medical-600" />
              <span className="text-2xl font-bold text-gray-900">
                AIforHealth
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/login">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </Container>
      </header>

      {/* Hero Section */}
      <Section background="gradient" padding="xl">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-medical-100 text-medical-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Healthcare Platform</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Never Miss a Medical
            <br />
            <span className="text-medical-600">Appointment Again</span>
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Smart scheduling, AI health guidance, and automated reminders - all
            in one platform. Take control of your healthcare journey today.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => openDemoModal("watch")}
            >
              Watch Demo
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Free 30-day trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Problems Section */}
      <Section background="white" padding="xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            The Healthcare Scheduling Crisis
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Millions of patients struggle with healthcare management every day
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-400">
          <Card hover>
            <CardContent>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                67M Missed Appointments
              </h3>
              <p className="hover:text-white mb-3">
                Every year in the US alone, costing the healthcare system
                billions and putting patient health at risk.
              </p>
              <div className="text-sm text-red-600 font-medium">
                $150 billion annual cost
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Poor Follow-Up Care
              </h3>
              <p className="hover:text-white mb-3">
                40% of patients don't follow up after initial consultations,
                leading to worsening conditions and preventable complications.
              </p>
              <div className="text-sm text-orange-600 font-medium">
                40% non-compliance rate
              </div>
            </CardContent>
          </Card>

          <Card hover>
            <CardContent>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Overwhelmed Patients
              </h3>
              <p className="hover:text-white mb-3">
                Managing multiple appointments, medications, and health records
                across different providers is confusing and time-consuming.
              </p>
              <div className="text-sm text-yellow-600 font-medium">
                3.2 hours/month wasted
              </div>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* AI Solution Section */}
      <Section background="gray" padding="xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center space-x-2 bg-medical-100 text-medical-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered Solution</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Smart Healthcare Management with AI
            </h2>

            <p className="text-lg text-gray-600 mb-8">
              Our AI-powered platform learns your health patterns, predicts your
              needs, and ensures you never miss important appointments or
              follow-ups.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-medical-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Bell className="h-4 w-4 text-medical-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Intelligent Reminders
                  </h4>
                  <p className="text-gray-800">
                    AI-powered notifications sent at the optimal time based on
                    your schedule and preferences
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-medical-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageCircle className="h-4 w-4 text-medical-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    24/7 Health Assistant
                  </h4>
                  <p className="text-gray-800">
                    Get instant answers to health questions and symptom guidance
                    anytime, anywhere
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-medical-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Calendar className="h-4 w-4 text-medical-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Smart Scheduling
                  </h4>
                  <p className="text-gray-800">
                    Automatically find the best appointment times that work for
                    both you and your doctor
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-medical-50 rounded-lg">
                  <div className="w-10 h-10 bg-medical-600 rounded-full flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      AI Health Assistant
                    </p>
                    <p className="text-xs text-gray-600">
                      How can I help you today?
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Appointment Confirmed
                    </p>
                    <p className="text-xs text-gray-600">
                      Dr. Wilson - Tomorrow 10:00 AM
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Reminder Set
                    </p>
                    <p className="text-xs text-gray-600">
                      Take medication in 2 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* How It Works Section */}
      <Section background="white" padding="xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get started in minutes with our simple 3-step process
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection Lines */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-medical-200 via-medical-400 to-medical-200"></div>

          {/* Step 1 */}
          <div className="relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-medical-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-medical-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-medical-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Create Your Profile
                </h3>
                <p className="text-gray-800">
                  Sign up in 60 seconds and add your health information,
                  preferences, and insurance details securely.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-medical-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-medical-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-6 w-6 text-medical-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Book Appointments
                </h3>
                <p className="text-gray-800">
                  Find and book appointments with top-rated doctors in your
                  area. Our AI suggests the best times for you.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-medical-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-12 h-12 bg-medical-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-6 w-6 text-medical-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Let AI Handle the Rest
                </h3>
                <p className="text-gray-800">
                  Receive smart reminders, health insights, and personalized
                  recommendations to stay on top of your health.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Features Highlight */}
      <Section background="gray" padding="xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need in One Platform
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-gray-400">
          <Card>
            <CardContent className="text-center">
              <div className="w-12 h-12 bg-medical-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-medical-600" />
              </div>
              <h4 className="font-semibold text-white mb-2">HIPAA Compliant</h4>
              <p className="text-sm hover:text-white">
                Your data is encrypted and secure
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <div className="w-12 h-12 bg-medical-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-medical-600" />
              </div>
              <h4 className="font-semibold text-white mb-2">Instant Access</h4>
              <p className="text-sm hover:text-white">
                Available 24/7 on any device
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <div className="w-12 h-12 bg-medical-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-medical-600" />
              </div>
              <h4 className="font-semibold text-white mb-2">Family Accounts</h4>
              <p className="text-sm hover:text-white">
                Manage care for loved ones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="text-center">
              <div className="w-12 h-12 bg-medical-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-medical-600" />
              </div>
              <h4 className="font-semibold text-white mb-2">AI Assistant</h4>
              <p className="text-sm hover:text-white">
                Get instant health guidance
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* CTA Section */}
      <Section background="medical" padding="xl">
        <div className="text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Healthcare?
          </h2>
          <p className="text-xl text-medical-100 mb-8 max-w-2xl mx-auto">
            Join thousands of patients who never miss appointments and stay on
            top of their health
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto bg-white hover:bg-gray-100 text-medical-600"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-white text-white hover:bg-medical-700"
              onClick={() => openDemoModal("schedule")}
            >
              Schedule a Demo
            </Button>
          </div>
          <p className="mt-6 text-sm text-medical-100">
            No credit card required • Free 30-day trial • Cancel anytime
          </p>
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-6 w-6 text-medical-400" />
                <span className="text-xl font-bold">AIforHealth</span>
              </div>
              <p className="text-gray-400 text-sm">
                Next-generation AI healthcare platform for modern patients and
                providers.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Security
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 AIforHealth. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm">
              Built for healthcare innovation
            </p>
          </div>
        </Container>
      </footer>

      {/* Medical Disclaimer */}
      <div className="bg-yellow-50 border-t border-yellow-200 py-3">
        <Container>
          <p className="text-xs text-yellow-800 text-center">
            <strong>Medical Disclaimer:</strong> This platform provides general
            health information only. Always consult qualified healthcare
            providers for medical advice, diagnosis, or treatment.
          </p>
        </Container>
      </div>

      {/* Demo Modal */}
      <DemoModal
        isOpen={demoModal.isOpen}
        onClose={closeDemoModal}
        type={demoModal.type}
      />
    </div>
  );
}