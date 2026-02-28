import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Heart, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      {/* Healthcare Disclaimer */}
      <div className="bg-red-900 text-red-100 px-6 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Important Medical Disclaimer</p>
              <p>
                This platform provides general health information and AI-assisted tools for educational purposes only. 
                It is not intended to replace professional medical advice, diagnosis, or treatment. Always seek the advice 
                of qualified healthcare providers with any questions regarding medical conditions. Never disregard professional 
                medical advice or delay seeking treatment because of information obtained through this platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4 md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <Heart className="w-6 h-6 text-red-500" aria-hidden="true" />
              <h3 className="text-xl font-bold">AIforHealth</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Empowering healthcare through artificial intelligence and innovative technology solutions.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on Twitter"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Follow us on LinkedIn"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links, Support & Contact - Horizontal on Mobile */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 md:col-span-2 lg:col-span-3">
            {/* Quick Links */}
            <div className="space-y-3 md:space-y-4">
              <h4 className="text-base md:text-lg font-semibold">Product</h4>
              <nav className="space-y-1.5 md:space-y-2">
                <Link to="/app/dashboard" className="block text-gray-300 hover:text-white transition-colors text-xs md:text-sm">
                  Dashboard
                </Link>
                <Link to="/app/appointments" className="block text-gray-300 hover:text-white transition-colors text-xs md:text-sm">
                  Appointments
                </Link>
                <Link to="/app/ai-chat" className="block text-gray-300 hover:text-white transition-colors text-xs md:text-sm">
                  AI Assistant
                </Link>
                <Link to="/app/symptom-checker" className="block text-gray-300 hover:text-white transition-colors text-xs md:text-sm">
                  Symptoms
                </Link>
              </nav>
            </div>

            {/* Support */}
            <div className="space-y-3 md:space-y-4">
              <h4 className="text-base md:text-lg font-semibold">Company</h4>
              <nav className="space-y-1.5 md:space-y-2">
                <a href="/help" className="block text-gray-300 hover:text-white transition-colors text-xs md:text-sm">
                  Help Center
                </a>
                <a href="/privacy" className="block text-gray-300 hover:text-white transition-colors text-xs md:text-sm">
                  Privacy
                </a>
                <a href="/terms" className="block text-gray-300 hover:text-white transition-colors text-xs md:text-sm">
                  Terms
                </a>
                <a href="/accessibility" className="block text-gray-300 hover:text-white transition-colors text-xs md:text-sm">
                  Access
                </a>
              </nav>
            </div>

            {/* Contact */}
            <div className="space-y-3 md:space-y-4">
              <h4 className="text-base md:text-lg font-semibold">Support</h4>
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-300">
                  <Phone className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" aria-hidden="true" />
                  <span className="truncate">1-800-432-5844</span>
                </div>
                <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-300">
                  <Mail className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" aria-hidden="true" />
                  <a href="mailto:support@aiforhealth.com" className="hover:text-white transition-colors truncate">
                    support@ai...
                  </a>
                </div>
                <div className="flex items-start space-x-2 text-xs md:text-sm text-gray-300">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <address className="not-italic">
                    123 Healthcare Ave<br className="hidden md:block" />
                    <span className="md:hidden">Health City</span>
                    <span className="hidden md:inline">Medical District<br />Health City, HC 12345</span>
                  </address>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 md:mt-12 pt-6 md:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-xs md:text-sm text-gray-400">
              © {new Date().getFullYear()} AIforHealth. All rights reserved.
            </div>
            <div className="flex items-center space-x-3 md:space-x-6 text-xs md:text-sm text-gray-400">
              <span>HIPAA</span>
              <span>•</span>
              <span>SOC 2</span>
              <span>•</span>
              <span>FDA</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};