import { useEffect, useState } from 'react';
import { bookingService } from '@/services/bookingService';
import apiAdapter from '@/services/apiAdapter';

export function ClinicsDebug() {
  const [clinics, setClinics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestDetails, setRequestDetails] = useState<any>(null);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        console.log('🏥 Starting clinic fetch...');
        console.log('🏥 API Base URL:', 'http://localhost:5000/api/v1');
        
        // Test direct API call first
        console.log('🏥 Testing direct API call...');
        const directResponse = await fetch('http://localhost:5000/api/v1/clinics');
        console.log('🏥 Direct fetch response:', directResponse);
        console.log('🏥 Direct fetch status:', directResponse.status);
        
        if (!directResponse.ok) {
          throw new Error(`Direct fetch failed: ${directResponse.status} ${directResponse.statusText}`);
        }
        
        const directData = await directResponse.json();
        console.log('🏥 Direct fetch data:', directData);
        
        // Now test through our service
        console.log('🏥 Testing through bookingService...');
        const serviceData = await bookingService.getClinics();
        console.log('🏥 Service data:', serviceData);
        
        setClinics({ direct: directData, service: serviceData });
        setRequestDetails({
          directStatus: directResponse.status,
          directHeaders: Object.fromEntries(directResponse.headers.entries()),
          serviceResult: serviceData
        });
        
      } catch (err) {
        console.error('❌ Error fetching clinics:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setRequestDetails({ error: err });
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  if (loading) return <div className="p-4 bg-yellow-100 rounded">🔄 Loading clinics debug info...</div>;
  if (error) return <div className="p-4 bg-red-100 rounded">❌ Error: {error}</div>;

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="font-bold mb-2">🏥 Clinics Debug Info:</h3>
      <div className="space-y-2">
        <div>
          <strong>Request Details:</strong>
          <pre className="text-xs overflow-auto bg-white p-2 rounded">
            {JSON.stringify(requestDetails, null, 2)}
          </pre>
        </div>
        <div>
          <strong>Clinics Data:</strong>
          <pre className="text-xs overflow-auto bg-white p-2 rounded max-h-40">
            {JSON.stringify(clinics, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}