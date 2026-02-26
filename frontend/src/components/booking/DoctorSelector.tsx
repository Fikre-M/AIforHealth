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
  isLoading = false 
}: DoctorSelectorProps) {
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

  if (doctors.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-800">No doctors available at this clinic</p>
        <p className="text-sm text-gray-600">Please select a different clinic</p>
      </div>
    );
  }

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.languages.some(lang => 
      lang.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const formatNextAvailable = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Select Doctor
        </h3>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search doctors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto space-y-4">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-800">No doctors found</p>
            <p className="text-sm text-gray-600">Try adjusting your search terms</p>
          </div>
        ) : (
          filteredDoctors.map((doctor) => (
            <div 
              key={doctor.id}
              className="cursor-pointer"
              onClick={() => onSelectDoctor(doctor.id)}
            >
              <Card 
                className={`transition-all ${
                  selectedDoctorId === doctor.id 
                    ? 'ring-2 ring-medical-500 border-medical-500 bg-medical-50' 
                    : 'hover:shadow-md hover:border-gray-300'
                }`}
                overflow="hidden"
              >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-4 flex-1 min-w-0">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-medical-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {doctor.avatar ? (
                        <img 
                          src={doctor.avatar} 
                          alt={doctor.name} 
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 sm:h-8 sm:w-8 text-medical-600" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 truncate flex-shrink-0">
                          {doctor.name}
                        </h4>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-800">{doctor.rating}</span>
                        </div>
                        {doctor.isAvailable ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex-shrink-0">
                            Available
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex-shrink-0">
                            Busy
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-medical-600 font-medium mb-3 truncate">
                        {doctor.specialty}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 text-sm">
                        <div className="flex items-center text-gray-800">
                          <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{doctor.experience} years exp.</span>
                        </div>
                        <div className="flex items-center text-gray-800">
                          <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">${doctor.consultationFee}</span>
                        </div>
                        {doctor.languages.length > 0 && (
                          <div className="flex items-center text-gray-800 sm:col-span-2">
                            <Globe className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="truncate">
                              {doctor.languages.slice(0, 2).join(', ')}
                              {doctor.languages.length > 2 && ` +${doctor.languages.length - 2} more`}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {doctor.education.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-600 font-medium mb-1">Education:</p>
                          <div className="space-y-1">
                            {doctor.education.slice(0, 1).map((edu, index) => (
                              <p key={index} className="text-xs text-gray-700 truncate" title={edu}>
                                {edu}
                              </p>
                            ))}
                            {doctor.education.length > 1 && (
                              <p className="text-xs text-gray-600">
                                +{doctor.education.length - 1} more qualifications
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm text-medical-600">
                        <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          Next: {formatNextAvailable(doctor.nextAvailable)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0">
                    <Button
                      variant={selectedDoctorId === doctor.id ? 'primary' : 'outline'}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDoctor(doctor.id);
                      }}
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