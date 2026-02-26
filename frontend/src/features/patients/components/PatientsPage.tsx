import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Plus, 
  Filter,
  Eye,
  Edit,
  Phone,
  Mail,
  Calendar,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { doctorService } from '@/services/doctorService';
import type { Patient } from '@/types/doctor';

export function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const patientsPerPage = 10;

  useEffect(() => {
    loadPatients();
  }, [currentPage, searchTerm]);

  const loadPatients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await doctorService.getPatients({
        page: currentPage,
        limit: patientsPerPage,
        search: searchTerm || undefined
      });
      setPatients(response.patients);
      setTotalPatients(response.total);
    } catch (err) {
      setError('Failed to load patients');
      console.error('Error loading patients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleViewPatient = (patientId: string) => {
    navigate(`/app/patients/${patientId}`);
  };

  const handleEditPatient = (patientId: string) => {
    navigate(`/app/patients/${patientId}/edit`);
  };

  const totalPages = Math.ceil(totalPatients / patientsPerPage);

  if (isLoading && patients.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <LoadingSkeleton className="h-8 w-48" />
          <LoadingSkeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent padding="md">
                <div className="flex items-center space-x-4">
                  <LoadingSkeleton variant="circular" width={48} height={48} />
                  <div className="flex-1 space-y-2">
                    <LoadingSkeleton className="h-5 w-48" />
                    <LoadingSkeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Patients
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your patient roster ({totalPatients} total)
          </p>
        </div>
        <Button 
          variant="primary"
          onClick={() => navigate('/app/patients/new')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add New Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent padding="md">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      {error ? (
        <ErrorState
          title="Failed to load patients"
          message={error}
          type="server"
          onRetry={loadPatients}
        />
      ) : patients.length === 0 && !isLoading ? (
        <EmptyState
          type="generic"
          title="No Patients Found"
          message={searchTerm ? "No patients match your search criteria" : "You haven't added any patients yet"}
          showAction={!searchTerm}
          actionLabel="Add First Patient"
          onAction={() => navigate('/app/patients/new')}
        />
      ) : (
        <div className="space-y-4">
          {patients.map((patient) => (
            <Card key={patient.id} hover>
              <CardContent padding="md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {patient.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          <span className="truncate">{patient.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Age: {patient.age}</span>
                        </div>
                      </div>
                      {patient.address && (
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-500 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="truncate">{patient.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewPatient(patient.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPatient(patient.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((currentPage - 1) * patientsPerPage) + 1} to {Math.min(currentPage * patientsPerPage, totalPatients)} of {totalPatients} patients
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}