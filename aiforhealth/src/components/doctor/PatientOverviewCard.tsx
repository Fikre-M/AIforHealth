import { User, Phone, Mail, Calendar, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Patient, PatientSummary } from '@/types/doctor';

interface PatientOverviewCardProps {
  patient: Patient;
  summary?: PatientSummary;
  onViewDetails: (patientId: string) => void;
}

export function PatientOverviewCard({ patient, summary, onViewDetails }: PatientOverviewCardProps) {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'concerning': return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <Card hover className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-medical-100 rounded-full flex items-center justify-center">
              {patient.avatar ? (
                <img src={patient.avatar} alt={patient.name} className="w-12 h-12 rounded-full" />
              ) : (
                <User className="h-6 w-6 text-medical-600" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{patient.name}</h3>
              <p className="text-sm text-gray-600">
                {calculateAge(patient.dateOfBirth)} years • {patient.gender}
              </p>
            </div>
          </div>
          {summary && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(summary.riskLevel)}`}>
              {summary.riskLevel} risk
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Contact Information */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="h-4 w-4 mr-2" />
              {patient.email}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              {patient.phone}
            </div>
            {patient.lastVisit && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Medical Information */}
          <div className="space-y-2">
            {patient.bloodType && (
              <div className="text-sm">
                <span className="font-medium text-gray-700">Blood Type:</span>
                <span className="ml-2 text-gray-600">{patient.bloodType}</span>
              </div>
            )}
            
            {patient.allergies.length > 0 && (
              <div className="text-sm">
                <span className="font-medium text-gray-700">Allergies:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {patient.allergies.map((allergy, index) => (
                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      <AlertTriangle className="h-3 w-3 inline mr-1" />
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patient.medicalHistory.length > 0 && (
              <div className="text-sm">
                <span className="font-medium text-gray-700">Conditions:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {patient.medicalHistory.slice(0, 3).map((condition, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {condition}
                    </span>
                  ))}
                  {patient.medicalHistory.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{patient.medicalHistory.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* AI Summary */}
          {summary && (
            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Health Trends</span>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(summary.vitalTrends.overall)}
                  <span className="text-xs text-gray-600 capitalize">{summary.vitalTrends.overall}</span>
                </div>
              </div>
              
              {summary.medicationCompliance && (
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Medication Compliance</span>
                    <span>{summary.medicationCompliance}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        summary.medicationCompliance >= 90 ? 'bg-green-500' :
                        summary.medicationCompliance >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${summary.medicationCompliance}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {summary.aiInsights.length > 0 && (
                <div className="text-xs text-gray-600 mb-3">
                  <span className="font-medium">AI Insight:</span>
                  <p className="mt-1">{summary.aiInsights[0]}</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(patient.id)}
              className="w-full"
            >
              View Full Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}