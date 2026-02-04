import { useState } from 'react';
import { MapPin, Phone, Star, Clock, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <Card>
              <CardContent>
                <div className="h-32 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  // Filter clinics based on search term
  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.specialties.some(specialty => 
      specialty.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Select Clinic or Hospital
        </h3>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clinics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-4">
        {filteredClinics.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <MapPin className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-600">No clinics found</p>
            <p className="text-sm text-gray-500">Try adjusting your search terms</p>
          </div>
        ) : (
          filteredClinics.map((clinic) => (
            <div 
              key={clinic.id}
              className={`cursor-pointer transition-all ${
                selectedClinicId === clinic.id 
                  ? 'ring-2 ring-medical-500 border-medical-500 bg-medical-50' 
                  : 'hover:shadow-md hover:border-gray-300'
              }`}
              onClick={() => onSelectClinic(clinic.id)}
            >
              <Card overflow="hidden">
                <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 truncate flex-shrink-0">
                        {clinic.name}
                      </h4>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-800">{clinic.rating}</span>
                      </div>
                      {clinic.isOpen ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex-shrink-0">
                          Open
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex-shrink-0">
                          Closed
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-start text-sm text-gray-800">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="break-words">{clinic.address}</span>
                          {clinic.distance && (
                            <span className="ml-2 text-medical-600 font-medium">
                              ({clinic.distance} miles)
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-800">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{clinic.phone}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {clinic.specialties.slice(0, 3).map((specialty, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-medical-100 text-medical-700 text-xs rounded-full truncate max-w-32"
                          title={specialty}
                        >
                          {specialty}
                        </span>
                      ))}
                      {clinic.specialties.length > 3 && (
                        <span 
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full flex-shrink-0"
                          title={clinic.specialties.slice(3).join(', ')}
                        >
                          +{clinic.specialties.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    {/* Opening Hours Preview */}
                    <div className="flex items-center text-xs text-gray-600">
                      <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                      {clinic.openingHours.monday ? (
                        <span className="truncate">
                          Mon-Fri: {clinic.openingHours.monday.open} - {clinic.openingHours.monday.close}
                        </span>
                      ) : (
                        <span>24/7 Emergency Care</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}