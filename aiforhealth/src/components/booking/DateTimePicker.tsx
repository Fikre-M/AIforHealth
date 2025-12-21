import { useState } from 'react';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { DayAvailability, TimeSlot } from '@/types/booking';
import { format, parseISO, addDays } from 'date-fns';

interface DateTimePickerProps {
  availability: DayAvailability[];
  selectedDate?: string;
  selectedTime?: string;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
  isLoading?: boolean;
}

export function DateTimePicker({
  availability,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
  isLoading = false
}: DateTimePickerProps) {
  const [viewMode, setViewMode] = useState<'date' | 'time'>('date');

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <Card>
          <CardContent>
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedDayAvailability = availability.find(day => day.date === selectedDate);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-4">
        <Button
          variant={viewMode === 'date' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setViewMode('date')}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Select Date
        </Button>
        <Button
          variant={viewMode === 'time' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setViewMode('time')}
          disabled={!selectedDate}
        >
          <Clock className="h-4 w-4 mr-2" />
          Select Time
        </Button>
      </div>

      {viewMode === 'date' && (
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Select Appointment Date
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availability.map((day) => {
                const date = parseISO(day.date);
                const isSelected = selectedDate === day.date;
                const availableSlots = day.slots.filter(slot => slot.available).length;
                
                return (
                  <button
                    key={day.date}
                    onClick={() => {
                      if (day.isAvailable) {
                        onSelectDate(day.date);
                        setViewMode('time');
                      }
                    }}
                    disabled={!day.isAvailable}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      isSelected
                        ? 'border-medical-500 bg-medical-50'
                        : day.isAvailable
                        ? 'border-gray-200 hover:border-medical-300 hover:bg-gray-50'
                        : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">
                      {format(date, 'EEE')}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {format(date, 'd')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {format(date, 'MMM')}
                    </div>
                    {day.isAvailable && (
                      <div className="text-xs text-medical-600 mt-2">
                        {availableSlots} slots
                      </div>
                    )}
                    {!day.isAvailable && (
                      <div className="text-xs text-red-600 mt-2">
                        Unavailable
                      </div>
                    )}
                    {isSelected && (
                      <CheckCircle className="h-4 w-4 text-medical-600 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'time' && selectedDayAvailability && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Time Slot
              </h3>
              <div className="text-sm text-gray-600">
                {selectedDate && format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
              </div>
            </div>

            <div className="space-y-4">
              {/* Morning Slots */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Morning</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {selectedDayAvailability.slots
                    .filter(slot => {
                      const hour = parseInt(slot.time.split(':')[0]);
                      return hour < 12;
                    })
                    .map((slot) => (
                      <TimeSlotButton
                        key={slot.time}
                        slot={slot}
                        isSelected={selectedTime === slot.time}
                        onSelect={() => onSelectTime(slot.time)}
                      />
                    ))}
                </div>
              </div>

              {/* Afternoon Slots */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Afternoon</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {selectedDayAvailability.slots
                    .filter(slot => {
                      const hour = parseInt(slot.time.split(':')[0]);
                      return hour >= 12 && hour < 17;
                    })
                    .map((slot) => (
                      <TimeSlotButton
                        key={slot.time}
                        slot={slot}
                        isSelected={selectedTime === slot.time}
                        onSelect={() => onSelectTime(slot.time)}
                      />
                    ))}
                </div>
              </div>

              {/* Evening Slots */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Evening</h4>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {selectedDayAvailability.slots
                    .filter(slot => {
                      const hour = parseInt(slot.time.split(':')[0]);
                      return hour >= 17;
                    })
                    .map((slot) => (
                      <TimeSlotButton
                        key={slot.time}
                        slot={slot}
                        isSelected={selectedTime === slot.time}
                        onSelect={() => onSelectTime(slot.time)}
                      />
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TimeSlotButton({ 
  slot, 
  isSelected, 
  onSelect 
}: { 
  slot: TimeSlot; 
  isSelected: boolean; 
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      disabled={!slot.available}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isSelected
          ? 'bg-medical-600 text-white'
          : slot.available
          ? 'bg-white border border-gray-300 text-gray-700 hover:border-medical-500 hover:bg-medical-50'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      {slot.time}
    </button>
  );
}