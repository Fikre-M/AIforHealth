import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import type { SymptomInput as SymptomInputType } from '@/types/symptomChecker';

interface SymptomInputProps {
  onSubmitSymptoms: (symptoms: SymptomInputType[]) => void;
  isLoading?: boolean;
}

export function SymptomInput({ onSubmitSymptoms, isLoading = false }: SymptomInputProps) {
  const [symptoms, setSymptoms] = useState<SymptomInputType[]>([
    {
      symptom: '',
      severity: 'mild',
      duration: '',
      location: '',
      triggers: [],
      additionalInfo: ''
    }
  ]);
  const [showDetailedForm, setShowDetailedForm] = useState(false);

  const severityOptions = [
    { value: 'mild', label: 'Mild - Barely noticeable' },
    { value: 'moderate', label: 'Moderate - Noticeable but manageable' },
    { value: 'severe', label: 'Severe - Significantly impacts daily activities' }
  ];

  const durationOptions = [
    { value: 'less-than-hour', label: 'Less than 1 hour' },
    { value: 'few-hours', label: 'A few hours' },
    { value: 'today', label: 'Started today' },
    { value: 'few-days', label: 'A few days' },
    { value: 'week', label: 'About a week' },
    { value: 'weeks', label: 'Several weeks' },
    { value: 'months', label: 'Months' },
    { value: 'chronic', label: 'Chronic/Long-term' }
  ];

  const addSymptom = () => {
    setSymptoms([...symptoms, {
      symptom: '',
      severity: 'mild',
      duration: '',
      location: '',
      triggers: [],
      additionalInfo: ''
    }]);
  };

  const removeSymptom = (index: number) => {
    if (symptoms.length > 1) {
      setSymptoms(symptoms.filter((_, i) => i !== index));
    }
  };

  const updateSymptom = (index: number, field: keyof SymptomInputType, value: any) => {
    const updatedSymptoms = symptoms.map((symptom, i) => 
      i === index ? { ...symptom, [field]: value } : symptom
    );
    setSymptoms(updatedSymptoms);
  };

  const handleSubmit = () => {
    const validSymptoms = symptoms.filter(s => s.symptom.trim() !== '');
    if (validSymptoms.length > 0) {
      onSubmitSymptoms(validSymptoms);
    }
  };

  const canSubmit = symptoms.some(s => s.symptom.trim() !== '') && !isLoading;

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Describe Your Symptoms
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetailedForm(!showDetailedForm)}
            >
              {showDetailedForm ? 'Simple Form' : 'Detailed Form'}
            </Button>
          </div>

          {symptoms.map((symptom, index) => (
            <div key={index} className="space-y-3 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Symptom {index + 1}
                </span>
                {symptoms.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSymptom(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="What are you experiencing?"
                  value={symptom.symptom}
                  onChange={(e) => updateSymptom(index, 'symptom', e.target.value)}
                  placeholder="e.g., headache, chest pain, fever"
                  required
                />

                <Select
                  label="How severe is it?"
                  value={symptom.severity}
                  onChange={(e) => updateSymptom(index, 'severity', e.target.value)}
                  options={severityOptions}
                  required
                />
              </div>

              {showDetailedForm && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Select
                      label="How long have you had this?"
                      value={symptom.duration}
                      onChange={(e) => updateSymptom(index, 'duration', e.target.value)}
                      options={[
                        { value: '', label: 'Select duration...' },
                        ...durationOptions
                      ]}
                    />

                    <Input
                      label="Where is it located? (Optional)"
                      value={symptom.location}
                      onChange={(e) => updateSymptom(index, 'location', e.target.value)}
                      placeholder="e.g., left side of head, upper chest"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Information (Optional)
                    </label>
                    <textarea
                      value={symptom.additionalInfo}
                      onChange={(e) => updateSymptom(index, 'additionalInfo', e.target.value)}
                      placeholder="Any triggers, patterns, or additional details..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={addSymptom}
              disabled={symptoms.length >= 5}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Symptom
            </Button>

            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isLoading ? 'Analyzing...' : 'Get AI Analysis'}
            </Button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Be as specific as possible about your symptoms. 
              Include details like when they started, what makes them better or worse, 
              and any associated symptoms.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}