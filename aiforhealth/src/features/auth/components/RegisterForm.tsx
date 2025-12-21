import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Heart, 
  User, 
  Phone, 
  Stethoscope,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { validateForm, validationRules } from '@/utils/validation';
import type { RegisterData } from '@/types/auth';

export function RegisterForm() {
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'patient',
    phone: '',
    specialization: '',
    licenseNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (submitError) {
      setSubmitError('');
    }
  };

  const validateStep1 = () => {
    const step1Rules = {
      email: validationRules.email,
      password: validationRules.password,
      confirmPassword: {
        required: true,
        custom: (value: string) => {
          if (value !== formData.password) {
            return 'Passwords do not match';
          }
          return null;
        }
      },
      name: validationRules.name,
    };

    const validationErrors = validateForm(formData, step1Rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const validateStep2 = () => {
    const step2Rules: any = {
      role: { required: true },
    };

    if (formData.phone) {
      step2Rules.phone = validationRules.phone;
    }

    if (formData.role === 'doctor') {
      step2Rules.specialization = { required: true };
      step2Rules.licenseNumber = { required: true };
    }

    const validationErrors = validateForm(formData, step2Rules);
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateStep2()) {
      return;
    }

    try {
      await register(formData);
      navigate('/app/dashboard');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Registration failed');
    }
  };

  const roleOptions = [
    { value: 'patient', label: 'Patient - I need healthcare services' },
    { value: 'doctor', label: 'Doctor - I provide healthcare services' },
  ];

  const specializationOptions = [
    { value: '', label: 'Select your specialization' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'endocrinology', label: 'Endocrinology' },
    { value: 'gastroenterology', label: 'Gastroenterology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'oncology', label: 'Oncology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'psychiatry', label: 'Psychiatry' },
    { value: 'radiology', label: 'Radiology' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medical-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <Heart className="h-8 w-8 text-medical-600" />
            <span className="text-2xl font-bold text-gray-900">AIforHealth</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600">
            Join thousands of users managing their healthcare
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-medical-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-medical-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > 1 ? <CheckCircle className="h-5 w-5" /> : '1'}
            </div>
            <span className="text-sm font-medium">Account</span>
          </div>
          <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-medical-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-medical-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-medical-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Profile</span>
          </div>
        </div>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Global Error */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">{submitError}</div>
                </div>
              )}

              {/* Step 1: Account Information */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Account Information</h3>
                  </CardHeader>

                  <Input
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    icon={<User className="h-5 w-5" />}
                    placeholder="Enter your full name"
                    required
                  />

                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    icon={<Mail className="h-5 w-5" />}
                    placeholder="Enter your email"
                    required
                  />

                  <div className="relative">
                    <Input
                      label="Password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      icon={<Lock className="h-5 w-5" />}
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <Input
                      label="Confirm Password"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      error={errors.confirmPassword}
                      icon={<Lock className="h-5 w-5" />}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>

                  <Button
                    type="button"
                    onClick={handleNextStep}
                    variant="primary"
                    size="lg"
                    className="w-full"
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 2: Profile Information */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900">Profile Information</h3>
                  </CardHeader>

                  <Select
                    label="I am a..."
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    error={errors.role}
                    options={roleOptions}
                    required
                  />

                  <Input
                    label="Phone Number (Optional)"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    icon={<Phone className="h-5 w-5" />}
                    placeholder="Enter your phone number"
                  />

                  {/* Doctor-specific fields */}
                  {formData.role === 'doctor' && (
                    <>
                      <Select
                        label="Medical Specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        error={errors.specialization}
                        options={specializationOptions}
                        required
                      />

                      <Input
                        label="Medical License Number"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        error={errors.licenseNumber}
                        icon={<FileText className="h-5 w-5" />}
                        placeholder="Enter your license number"
                        required
                      />

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <Stethoscope className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-blue-700">
                            <p className="font-medium mb-1">Doctor Verification</p>
                            <p>Your medical credentials will be verified before you can start accepting patients.</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      onClick={handlePrevStep}
                      variant="outline"
                      size="lg"
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Creating account...' : 'Create account'}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-medical-600 hover:text-medical-500 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Terms */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-medical-600 hover:text-medical-500">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-medical-600 hover:text-medical-500">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}