import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Camera,
  Save,
  AlertCircle,
  CheckCircle2,
  Phone,
  Calendar,
  MapPin,
  Heart,
  Users,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  Loader2,
  X,
  Plus,
} from 'lucide-react';
import { profileService } from '@/services/profileService';
import { useAuth } from '@/hooks/useAuth';
import type { UserProfile, ProfileUpdateData } from '@/types/profile';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDateForInput(value?: string | Date | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

// ─── sub-components ──────────────────────────────────────────────────────────

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
        }}
        className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-blue-600 dark:text-blue-400">{icon}</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
            {title}
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {open && <div className="px-6 py-5">{children}</div>}
    </div>
  );
};

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
      {required === true && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const inputCls =
  'w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';

interface TagInputProps {
  values: string[];
  onChange: (vals: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ values, onChange, placeholder }) => {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setInput('');
  };

  return (
    <div className="flex flex-wrap gap-2 p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 min-h-[44px]">
      {values.map((v) => (
        <span
          key={v}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium"
        >
          {v}
          <button
            type="button"
            onClick={() => {
              onChange(values.filter((x) => x !== v));
            }}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <div className="flex items-center gap-1 flex-1 min-w-[120px]">
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
        />
        {input.trim().length > 0 && (
          <button
            type="button"
            onClick={add}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

// ─── extended form type to include doctor fields ─────────────────────────────

interface ExtendedProfileUpdateData extends ProfileUpdateData {
  specialization?: string;
  licenseNumber?: string;
}

// ─── main component ──────────────────────────────────────────────────────────

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [form, setForm] = useState<ExtendedProfileUpdateData>({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: undefined,
    address: { street: '', city: '', state: '', zipCode: '', country: '' },
    emergencyContact: { name: '', relationship: '', phone: '' },
    medicalInfo: { bloodType: '', allergies: [], medications: [], conditions: [] },
    specialization: '',
    licenseNumber: '',
  });

  useEffect(() => {
    if (user) void loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setAvatarPreview(data.avatar ?? null);
      setForm({
        name: data.name ?? '',
        phone: data.phone ?? '',
        dateOfBirth: formatDateForInput(data.dateOfBirth),
        gender: data.gender,
        address: data.address ?? { street: '', city: '', state: '', zipCode: '', country: '' },
        emergencyContact: data.emergencyContact ?? { name: '', relationship: '', phone: '' },
        medicalInfo: {
          bloodType: data.medicalInfo?.bloodType ?? '',
          allergies: data.medicalInfo?.allergies ?? [],
          medications: data.medicalInfo?.medications ?? [],
          conditions: data.medicalInfo?.conditions ?? [],
        },
        specialization: data.specialization ?? '',
        licenseNumber: data.licenseNumber ?? '',
      });
    } catch {
      setError('Failed to load profile. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB.');
      return;
    }

    try {
      setAvatarUploading(true);
      setError(null);
      const url = await profileService.uploadAvatar(file);
      setAvatarPreview(url);
      setProfile((prev) => (prev ? { ...prev, avatar: url } : prev));
      updateUser({ avatar: url });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        apiErr.response?.data?.message ??
          apiErr.message ??
          'Failed to upload photo. Please try again.'
      );
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name?.trim()) {
      setError('Full name is required.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const updated = await profileService.updateProfile(form);
      setProfile(updated);
      updateUser({ name: updated.name, avatar: updated.avatar });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 4000);
    } catch (err: unknown) {
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      setError(
        apiErr.response?.data?.message ??
          apiErr.message ??
          'Failed to save changes. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const setAddr = (key: string, val: string) => {
    setForm((f) => ({
      ...f,
      address: {
        ...f.address,
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        ...f.address,
        [key]: val,
      },
    }));
  };

  const setEmergency = (key: string, val: string) => {
    setForm((f) => ({
      ...f,
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        ...f.emergencyContact,
        [key]: val,
      },
    }));
  };

  const setMedical = (key: string, val: string | string[]) => {
    setForm((f) => ({
      ...f,
      medicalInfo: {
        bloodType: '',
        allergies: [],
        medications: [],
        conditions: [],
        ...f.medicalInfo,
        [key]: val,
      },
    }));
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
    );
  }

  const displayName = form.name ?? user?.name ?? '?';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your personal information
        </p>
      </div>

      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-4"
      >
        {/* Avatar card */}
        <div className="flex items-center gap-5 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/40 rounded-2xl">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center ring-4 ring-white dark:ring-gray-900 shadow-lg">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xl font-bold">{initials}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center shadow-md transition-colors"
              title="Change photo"
            >
              {avatarUploading ? (
                <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
              ) : (
                <Camera className="w-3.5 h-3.5 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                void handleAvatarChange(e);
              }}
              className="hidden"
            />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {form.name ?? user?.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile?.email ?? user?.email}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 capitalize">
              {profile?.role ?? user?.role}
            </span>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            {avatarUploading ? 'Uploading…' : 'Change photo'}
          </button>
        </div>

        {/* Alerts */}
        {error !== null && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                setError(null);
              }}
              className="ml-auto"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Saved successfully.</span>
          </div>
        )}

        {/* Basic Info */}
        <Section title="Basic Information" icon={<User className="w-4 h-4" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input
                className={inputCls}
                value={form.name ?? ''}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value }));
                }}
                placeholder="Your full name"
                required
              />
            </Field>
            <Field label="Phone Number">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className={`${inputCls} pl-9`}
                  type="tel"
                  value={form.phone ?? ''}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, phone: e.target.value }));
                  }}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </Field>
            <Field label="Date of Birth">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className={`${inputCls} pl-9`}
                  type="date"
                  value={form.dateOfBirth ?? ''}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, dateOfBirth: e.target.value }));
                  }}
                />
              </div>
            </Field>
            <Field label="Gender">
              <select
                className={inputCls}
                value={form.gender ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((f) => ({
                    ...f,
                    gender: (val as 'male' | 'female' | 'other' | 'prefer-not-to-say') || undefined,
                  }));
                }}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* Address */}
        <Section title="Address" icon={<MapPin className="w-4 h-4" />} defaultOpen={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Street Address">
                <input
                  className={inputCls}
                  value={form.address?.street ?? ''}
                  onChange={(e) => {
                    setAddr('street', e.target.value);
                  }}
                  placeholder="123 Main St"
                />
              </Field>
            </div>
            <Field label="City">
              <input
                className={inputCls}
                value={form.address?.city ?? ''}
                onChange={(e) => {
                  setAddr('city', e.target.value);
                }}
                placeholder="New York"
              />
            </Field>
            <Field label="State / Province">
              <input
                className={inputCls}
                value={form.address?.state ?? ''}
                onChange={(e) => {
                  setAddr('state', e.target.value);
                }}
                placeholder="NY"
              />
            </Field>
            <Field label="ZIP / Postal Code">
              <input
                className={inputCls}
                value={form.address?.zipCode ?? ''}
                onChange={(e) => {
                  setAddr('zipCode', e.target.value);
                }}
                placeholder="10001"
              />
            </Field>
            <Field label="Country">
              <input
                className={inputCls}
                value={form.address?.country ?? ''}
                onChange={(e) => {
                  setAddr('country', e.target.value);
                }}
                placeholder="United States"
              />
            </Field>
          </div>
        </Section>

        {/* Emergency Contact */}
        <Section title="Emergency Contact" icon={<Users className="w-4 h-4" />} defaultOpen={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contact Name">
              <input
                className={inputCls}
                value={form.emergencyContact?.name ?? ''}
                onChange={(e) => {
                  setEmergency('name', e.target.value);
                }}
                placeholder="Jane Doe"
              />
            </Field>
            <Field label="Relationship">
              <input
                className={inputCls}
                value={form.emergencyContact?.relationship ?? ''}
                onChange={(e) => {
                  setEmergency('relationship', e.target.value);
                }}
                placeholder="Spouse, Parent, Sibling…"
              />
            </Field>
            <Field label="Phone Number">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  className={`${inputCls} pl-9`}
                  type="tel"
                  value={form.emergencyContact?.phone ?? ''}
                  onChange={(e) => {
                    setEmergency('phone', e.target.value);
                  }}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </Field>
          </div>
        </Section>

        {/* Medical Info */}
        <Section
          title="Medical Information"
          icon={<Heart className="w-4 h-4" />}
          defaultOpen={false}
        >
          <div className="space-y-4">
            <Field label="Blood Type">
              <select
                className={inputCls}
                value={form.medicalInfo?.bloodType ?? ''}
                onChange={(e) => {
                  setMedical('bloodType', e.target.value);
                }}
              >
                <option value="">Unknown</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Allergies">
              <TagInput
                values={form.medicalInfo?.allergies ?? []}
                onChange={(v) => {
                  setMedical('allergies', v);
                }}
                placeholder="Type and press Enter…"
              />
            </Field>
            <Field label="Current Medications">
              <TagInput
                values={form.medicalInfo?.medications ?? []}
                onChange={(v) => {
                  setMedical('medications', v);
                }}
                placeholder="Type and press Enter…"
              />
            </Field>
            <Field label="Medical Conditions">
              <TagInput
                values={form.medicalInfo?.conditions ?? []}
                onChange={(v) => {
                  setMedical('conditions', v);
                }}
                placeholder="Type and press Enter…"
              />
            </Field>
          </div>
        </Section>

        {/* Doctor-specific */}
        {(profile?.role === 'doctor' || user?.role === 'doctor') && (
          <Section title="Professional Information" icon={<Stethoscope className="w-4 h-4" />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Specialization">
                <input
                  className={inputCls}
                  value={form.specialization ?? ''}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, specialization: e.target.value }));
                  }}
                  placeholder="e.g. Cardiology"
                />
              </Field>
              <Field label="License Number">
                <input
                  className={inputCls}
                  value={form.licenseNumber ?? ''}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, licenseNumber: e.target.value }));
                  }}
                  placeholder="License #"
                />
              </Field>
            </div>
          </Section>
        )}

        {/* Save */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold shadow-sm transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
