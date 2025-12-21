import { AlertTriangle, Shield, Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface MedicalDisclaimerProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function MedicalDisclaimer({ onAccept, onDecline }: MedicalDisclaimerProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Important Medical Disclaimer
            </h2>
            <p className="text-gray-600">
              Please read and understand before using the AI Symptom Checker
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-medical-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Not a Medical Diagnosis
                </h3>
                <p className="text-sm text-gray-700">
                  This AI tool provides general health information only and cannot diagnose 
                  medical conditions. It is not a substitute for professional medical advice, 
                  diagnosis, or treatment.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-medical-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Emergency Situations
                </h3>
                <p className="text-sm text-gray-700">
                  If you are experiencing a medical emergency, call emergency services 
                  immediately. Do not rely on this tool for emergency medical situations.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-medical-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Professional Medical Care
                </h3>
                <p className="text-sm text-gray-700">
                  Always seek the advice of qualified healthcare providers with any 
                  questions about medical conditions. Never disregard professional 
                  medical advice because of information from this tool.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Emergency Warning Signs:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Severe chest pain or difficulty breathing</li>
                  <li>Signs of stroke (sudden weakness, speech problems)</li>
                  <li>Severe allergic reactions</li>
                  <li>Severe bleeding or trauma</li>
                  <li>Loss of consciousness</li>
                  <li>Severe abdominal pain</li>
                </ul>
                <p className="mt-2 font-semibold">
                  If experiencing any of these, call emergency services immediately!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-medical-50 border border-medical-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-medical-800 mb-2">
              What This Tool Can Help With:
            </h4>
            <ul className="text-sm text-medical-700 space-y-1">
              <li>• Provide general health information</li>
              <li>• Help you understand when to seek medical care</li>
              <li>• Suggest appropriate medical specialties</li>
              <li>• Offer guidance on symptom monitoring</li>
              <li>• Help you prepare for doctor visits</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={onAccept}
              className="flex-1"
            >
              I Understand - Continue
            </Button>
            <Button
              variant="outline"
              onClick={onDecline}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            By continuing, you acknowledge that you have read and understood this disclaimer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}