import { MapPin, Phone, Star, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { Clinic } from '@/types/booking';

interface ClinicSelectorProps {
  clinics: Clinic[];
  selectedClinicId?: string;
  onSelectClinic: (clinicId: string) => void;
  isLoading?: boolean;
}

export function ClinicSelector({ 
  clinics, 
  selectedClinicId, 
  onSelectClinic, 
  isLoading = false 
}: ClinicSelectorProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <Card>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Select Clinic or Hospital
      </h3>
      
      {clinics.map((clinic) => (
        <Card 
          key={clinic.id}
          className={`cursor-pointer transition-all ${
            selectedClinicId === clinic.id 
              ? 'ring-2 ring-medical-500 border-medical-500' 
              : 'hover:shadow-md'
          }`}
          onClick={() => onSelectClinic(clinic.id)}
        >
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className="font-semibold text-gray-900">{clinic.name}</h4>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-gray-600">{clinic.rating}</span>
                  </div>
                  {clinic.isOpen ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Open
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      Closed
                    </span>
                  )}
                </div>
                
                <div className="space-y-1 mb-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {clinic.address}
                    {clinic.distance && (
                      <span className="ml-2 text-medical-600">
                        ({clinic.distance} miles)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {clinic.phone}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {clinic.specialties.slice(0, 4).map((specialty, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-medical-100 text-medical-700 text-xs rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                  {clinic.specialties.length > 4 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{clinic.specialties.length - 4} more
                    </span>
                  )}
                </div>
                
                {/* Opening Hours Preview */}
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {clinic.openingHours.monday ? (
                    <span>
                      Mon-Fri: {clinic.openingHours.monday.open} - {clinic.openingHours.monday.close}
                    </span>
                  ) : (
                    <span>24/7 Emergency Care</span>
                  )}
                </div>
              </div>
              
              <div className="ml-4">
                <Button
                  variant={selectedClinicId === clinic.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectClinic(clinic.id);
                  }}
                >
                  {selectedClinicId === clinic.id ? 'Selected' : 'Select'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}