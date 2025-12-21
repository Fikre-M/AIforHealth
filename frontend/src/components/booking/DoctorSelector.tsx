import { User, Star, Clock, DollarSign, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <Card>
              <CardContent>
                <div className="h-24 bg-gray-200 rounded"></div>
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
        <p className="text-gray-600">No doctors available at this clinic</p>
        <p className="text-sm text-gray-500">Please select a different clinic</p>
      </div>
    );
  }

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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Select Doctor
      </h3>
      
      {doctors.map((doctor) => (
        <Card 
          key={doctor.id}
          className={`cursor-pointer transition-all ${
            selectedDoctorId === doctor.id 
              ? 'ring-2 ring-medical-500 border-medical-500' 
              : 'hover:shadow-md'
          }`}
          onClick={() => onSelectDoctor(doctor.id)}
        >
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-16 h-16 bg-medical-100 rounded-full flex items-center justify-center">
                  {doctor.avatar ? (
                    <img 
                      src={doctor.avatar} 
                      alt={doctor.name} 
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-medical-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">{doctor.rating}</span>
                    </div>
                    {doctor.isAvailable ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Available
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Busy
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-medical-600 font-medium mb-2">
                    {doctor.specialty}
                  </p>
                  
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {doctor.experience} years experience
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${doctor.consultationFee} consultation fee
                    </div>
                    {doctor.languages.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Globe className="h-4 w-4 mr-2" />
                        {doctor.languages.join(', ')}
                      </div>
                    )}
                  </div>
                  
                  {doctor.education.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">Education:</p>
                      <div className="space-y-1">
                        {doctor.education.slice(0, 2).map((edu, index) => (
                          <p key={index} className="text-xs text-gray-600">{edu}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-medical-600">
                    <Clock className="h-4 w-4 mr-1" />
                    Next available: {formatNextAvailable(doctor.nextAvailable)}
                  </div>
                </div>
              </div>
              
              <div className="ml-4">
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
      ))}
    </div>
  );
}