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
  isLoading = false,
}: ClinicSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <Card><CardContent><div className="h-32 bg-gray-200 rounded" /></CardContent></Card>
          </div>
        ))}
      </div>
    );
  }

  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinic.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Clinic or Hospital</h3>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search clinics..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="max-h-[32rem] overflow-y-auto space-y-3 pr-1">
        {filteredClinics.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-700 font-medium">No clinics found</p>
            <p className="text-sm text-gray-600 mt-1">Try adjusting your search terms</p>
          </div>
        ) : (
          filteredClinics.map((clinic) => (
            <div
              key={clinic.id}
              className={`cursor-pointer rounded-lg transition-all ${
                selectedClinicId === clinic.id
                  ? 'ring-2 ring-medical-500'
                  : 'hover:shadow-md'
              }`}
              onClick={() => onSelectClinic(clinic.id)}
            >
              <Card
                className={selectedClinicId === clinic.id ? 'border-medical-500 bg-medical-50' : ''}
                overflow="hidden"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">

                      {/* Title row */}
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 text-base leading-tight">
                          {clinic.name}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-gray-700">{clinic.rating}</span>
                        </div>
                        {clinic.isOpen ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full flex-shrink-0">Open</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full flex-shrink-0">Closed</span>
                        )}
                      </div>

                      {/* Address & phone */}
                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-start text-sm text-gray-700">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-gray-500" />
                          <span className="break-words">
                            {clinic.address}
                            {clinic.distance && (
                              <span className="ml-2 text-medical-600 font-medium">({clinic.distance} miles)</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-gray-500" />
                          <span>{clinic.phone}</span>
                        </div>
                      </div>

                      {/* Specialties */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {clinic.specialties.slice(0, 3).map((specialty, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-medical-100 text-medical-800 text-xs font-medium rounded-full"
                            title={specialty}
                          >
                            {specialty}
                          </span>
                        ))}
                        {clinic.specialties.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            +{clinic.specialties.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Hours */}
                      <div className="flex items-center text-xs text-gray-600">
                        <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                        {clinic.openingHours?.monday ? (
                          <span>Mon–Fri: {clinic.openingHours.monday.open} – {clinic.openingHours.monday.close}</span>
                        ) : (
                          <span>24/7 Emergency Care</span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <Button
                        variant={selectedClinicId === clinic.id ? 'primary' : 'outline'}
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onSelectClinic(clinic.id); }}
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
