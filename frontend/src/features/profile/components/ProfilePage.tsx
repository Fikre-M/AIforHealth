import React, { useState, useEffect } from 'react';
import { User, Camera, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { profileService } from '@/services/profileService';
import { useAuth } from '@/hooks/useAuth';
import type { UserProfile, ProfileUpdateData } from '@/types/profile';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: undefined,
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    medicalInfo: {
      bloodType: '',
      allergies: [],
      medications: [],
      conditions: []
    }
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const profileData = await profileService.getProfile(user.id);
      setProfile(profileData);
      
      // Update form data
      setFormData({
        name: profileData.name || '',
        phone: profileData.phone || '',
        dateOfBirth: profileData.dateOfBirth || '',
        gender: profileData.gender,
        address: profileData.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        emergencyContact: profileData.emergencyContact || {
          name: '',
          relationship: '',
          phone: ''
        },
        medicalInfo: profileData.medicalInfo || {
          bloodType: '',
          allergies: [],
          medications: [],
          conditions: []
        }
      });
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      setError(null);
      
      const updatedProfile = await profileService.updateProfile(user.id, formData);
      setProfile(updatedProfile);
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const avatarUrl = await profileService.uploadAvatar(user.id, file);
      if (profile) {
        setProfile({ ...profile, avatar: avatarUrl });
      }
    } catch (err) {
      setError('Failed to upload avatar');
    }
  };

  const handleArrayInput = (field: 'allergies' | 'medications' | 'conditions', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo!,
        [field]: items
      }
    }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="space-y-4">
          <LoadingSkeleton className="h-8 w-64" />
          <LoadingSkeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <LoadingSkeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <LoadingSkeleton variant="circular" width={96} height={96} />
              <div className="space-y-2">
                <LoadingSkeleton className="h-5 w-32" />
                <LoadingSkeleton className="h-4 w-48" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <LoadingSkeleton className="h-4 w-24" />
                  <LoadingSkeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Profile Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Section */}
          <CardContent padding="lg">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 rounded-full p-2 cursor-pointer transition-colors shadow-lg">
                  <Camera className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile Photo</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Upload a photo to personalize your profile</p>
              </div>
            </div>
          </CardContent>

          {/* Basic Information */}
          <CardContent padding="lg" className="border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <Select
                    value={formData.gender || ''}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      gender: e.target.value as any || undefined 
                    }))}
                    options={[
                      { value: '', label: 'Select gender' },
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                      { value: 'prefer-not-to-say', label: 'Prefer not to say' }
                    ]}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          {/* Address */}
          <CardContent padding="lg" className="border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Address</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Street Address
                  </label>
                  <Input
                    type="text"
                    value={formData.address?.street || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address!, street: e.target.value }
                    }))}
                    placeholder="Enter your street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City
                  </label>
                  <Input
                    type="text"
                    value={formData.address?.city || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address!, city: e.target.value }
                    }))}
                    placeholder="Enter your city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    State
                  </label>
                  <Input
                    type="text"
                    value={formData.address?.state || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address!, state: e.target.value }
                    }))}
                    placeholder="Enter your state"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ZIP Code
                  </label>
                  <Input
                    type="text"
                    value={formData.address?.zipCode || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address!, zipCode: e.target.value }
                    }))}
                    placeholder="Enter your ZIP code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Country
                  </label>
                  <Input
                    type="text"
                    value={formData.address?.country || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address!, country: e.target.value }
                    }))}
                    placeholder="Enter your country"
                  />
                </div>
              </div>
            </div>
          </CardContent>

          {/* Emergency Contact */}
          <CardContent padding="lg" className="border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Emergency Contact</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={formData.emergencyContact?.name || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact!, name: e.target.value }
                    }))}
                    placeholder="Emergency contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Relationship
                  </label>
                  <Input
                    type="text"
                    value={formData.emergencyContact?.relationship || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact!, relationship: e.target.value }
                    }))}
                    placeholder="Relationship to you"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={formData.emergencyContact?.phone || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact!, phone: e.target.value }
                    }))}
                    placeholder="Emergency contact phone"
                  />
                </div>
              </div>
            </div>
          </CardContent>

          {/* Medical Information */}
          {user?.role === 'patient' && (
            <CardContent padding="lg" className="border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Medical Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Blood Type
                    </label>
                    <Select
                      value={formData.medicalInfo?.bloodType || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        medicalInfo: { ...prev.medicalInfo!, bloodType: e.target.value }
                      }))}
                      options={[
                        { value: '', label: 'Select blood type' },
                        { value: 'A+', label: 'A+' },
                        { value: 'A-', label: 'A-' },
                        { value: 'B+', label: 'B+' },
                        { value: 'B-', label: 'B-' },
                        { value: 'AB+', label: 'AB+' },
                        { value: 'AB-', label: 'AB-' },
                        { value: 'O+', label: 'O+' },
                        { value: 'O-', label: 'O-' }
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Allergies
                    </label>
                    <Input
                      type="text"
                      placeholder="Separate with commas"
                      value={formData.medicalInfo?.allergies?.join(', ') || ''}
                      onChange={(e) => handleArrayInput('allergies', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Medications
                    </label>
                    <Input
                      type="text"
                      placeholder="Separate with commas"
                      value={formData.medicalInfo?.medications?.join(', ') || ''}
                      onChange={(e) => handleArrayInput('medications', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Medical Conditions
                    </label>
                    <Input
                      type="text"
                      placeholder="Separate with commas"
                      value={formData.medicalInfo?.conditions?.join(', ') || ''}
                      onChange={(e) => handleArrayInput('conditions', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          )}

          {/* Error/Success Messages */}
          <CardContent padding="lg">
            {error && (
              <div className="flex items-center space-x-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 mb-6">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {success && (
              <div className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-6">
                <span className="text-sm font-medium">Profile updated successfully!</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                loading={saving}
                loadingText="Saving..."
                leftIcon={<Save className="w-4 h-4" />}
                size="lg"
              >
                Save Changes
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};