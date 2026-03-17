import { User, Star, Clock, DollarSign, Globe, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';
import type { Doctor } from '@/types/booking';

interface DoctorSelectorProps {
  doctors: Doctor[];
  selectedDoctorId?: string;
  onSelectDoctor: (doctorId: string) => void;
  isLoading?: boolean;
}

export function DoctorSelector({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
  isLoading = false,
}: DoctorSelectorProps) {
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

  if (doctors.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-700 font-medium">No doctors available at this clinic</p>
        <p className="text-sm text-gray-600 mt-1">Please select a different clinic</p>
      </div>
    );
  }

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.languages.some(l => l.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatNextAvailable = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    if (date.toDateString() === today.toDateString()) return `Today at ${timeStr}`;
    if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow at ${timeStr}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Select Doctor</h3>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="max-h-[32rem] overflow-y-auto space-y-3 pr-1">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-700 font-medium">No doctors found</p>
            <p className="text-sm text-gray-600 mt-1">Try adjusting your search terms</p>
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <div
              key={doctor.id}
              className={`cursor-pointer rounded-lg transition-all ${
                selectedDoctorId === doctor.id ? 'ring-2 ring-medical-500' : 'hover:shadow-md'
              }`}
              onClick={() => onSelectDoctor(doctor.id)}
            >
              <Card
                className={selectedDoctorId === doctor.id ? 'border-medical-500 bg-medical-50' : ''}
                overflow="hidden"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">

                      {/* Avatar */}
                      <div className="w-14 h-14 bg-medical-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {doctor.avatar ? (
                          <img src={doctor.avatar} alt={doctor.name} className="w-14 h-14 rounded-full object-cover" />
                        ) : (
                          <User className="h-7 w-7 text-medical-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Name row */}
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-base leading-tight">
                            {doctor.name}
                          </h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-gray-700">{doctor.rating}</span>
                          </div>
                          {doctor.isAvailable ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">Available</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 text-xs font-medium rounded-full">Busy</span>
                          )}
                        </div>

                        {/* Specialty */}
                        <p className="text-sm font-semibold text-medical-700 mb-2">{doctor.specialty}</p>

                        {/* Details grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2 text-sm text-gray-700">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span>{doctor.experience} yrs experience</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <span>${doctor.consultationFee} / visit</span>
                          </div>
                          {doctor.languages.length > 0 && (
                            <div className="flex items-center gap-2 sm:col-span-2">
                              <Globe className="h-4 w-4 text-gray-500 flex-shrink-0" />
                              <span>{doctor.languages.slice(0, 2).join(', ')}{doctor.languages.length > 2 && ` +${doctor.languages.length - 2}`}</span>
                            </div>
                          )}
                        </div>

                        {/* Education */}
                        {doctor.education.length > 0 && (
                          <p className="text-xs text-gray-600 mb-2 truncate" title={doctor.education[0]}>
                            🎓 {doctor.education[0]}
                            {doctor.education.length > 1 && ` +${doctor.education.length - 1} more`}
                          </p>
                        )}

                        {/* Next available */}
                        <div className="flex items-center gap-1 text-sm text-medical-700 font-medium">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>Next: {formatNextAvailable(doctor.nextAvailable)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <Button
                        variant={selectedDoctorId === doctor.id ? 'primary' : 'outline'}
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onSelectDoctor(doctor.id); }}
                      >
                        {selectedDoctorId === doctor.id ? 'Selected' : 'Select'}
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
