# Doctor API Guide

## Authentication
All endpoints require a valid JWT token with doctor role.

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get Doctor Statistics
Get dashboard statistics for the logged-in doctor.

**Endpoint:** `GET /api/doctors/stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "todayAppointments": 5,
    "weekAppointments": 23,
    "monthAppointments": 87,
    "totalPatients": 156,
    "completedAppointments": 432,
    "cancelledAppointments": 23,
    "totalAppointments": 460
  }
}
```

---

### 2. Get Daily Appointments
Get all appointments scheduled for today.

**Endpoint:** `GET /api/doctors/appointments/daily`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "65f1234567890abcdef12345",
      "patient": {
        "_id": "65f1234567890abcdef12346",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "dateOfBirth": "1985-05-15T00:00:00.000Z",
        "gender": "male"
      },
      "appointmentDate": "2026-02-16T10:00:00.000Z",
      "duration": 30,
      "status": "scheduled",
      "type": "consultation",
      "reason": "Regular checkup",
      "symptoms": ["headache", "fatigue"]
    }
  ]
}
```

---

### 3. Get Upcoming Appointments
Get paginated list of upcoming appointments.

**Endpoint:** `GET /api/doctors/appointments/upcoming`

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page

**Example:** `GET /api/doctors/appointments/upcoming?page=1&limit=10`

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

### 4. Get Patients List
Get paginated, searchable list of patients.

**Endpoint:** `GET /api/doctors/patients`

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `search` (optional) - Search by name, email, or phone

**Example:** `GET /api/doctors/patients?page=1&limit=10&search=john`

**Response:**
```json
{
  "success": true,
  "patients": [
    {
      "_id": "65f1234567890abcdef12346",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "dateOfBirth": "1985-05-15T00:00:00.000Z",
      "age": 40,
      "gender": "male",
      "address": "123 Main St, City, State",
      "emergencyContact": {
        "name": "Jane Doe",
        "phone": "+1234567891",
        "relationship": "spouse"
      },
      "medicalHistory": ["Hypertension", "Diabetes Type 2"],
      "allergies": ["Penicillin"],
      "currentMedications": ["Metformin", "Lisinopril"],
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "total": 156,
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "pages": 16
  }
}
```

---

### 5. Get Patient Summaries
Get quick reference summaries for all patients.

**Endpoint:** `GET /api/doctors/patients/summaries`

**Response:**
```json
{
  "success": true,
  "count": 156,
  "data": [
    {
      "id": "65f1234567890abcdef12346",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "age": 40,
      "gender": "male",
      "lastVisit": "2026-02-10T14:00:00.000Z",
      "lastDiagnosis": "Common cold",
      "upcomingAppointment": "2026-02-20T10:00:00.000Z"
    }
  ]
}
```

---

### 6. Get Patient Details
Get detailed information about a specific patient.

**Endpoint:** `GET /api/doctors/patients/:patientId`

**Example:** `GET /api/doctors/patients/65f1234567890abcdef12346`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890abcdef12346",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "dateOfBirth": "1985-05-15T00:00:00.000Z",
    "gender": "male",
    "address": "123 Main St, City, State",
    "emergencyContact": {
      "name": "Jane Doe",
      "phone": "+1234567891",
      "relationship": "spouse"
    },
    "medicalHistory": ["Hypertension", "Diabetes Type 2"],
    "allergies": ["Penicillin"],
    "currentMedications": ["Metformin", "Lisinopril"],
    "role": "patient",
    "isActive": true,
    "isEmailVerified": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2026-02-01T10:00:00.000Z"
  }
}
```

**Error Response (No Access):**
```json
{
  "success": false,
  "message": "Failed to get patient details: Access denied: No appointment history with this patient"
}
```

---

### 7. Create Patient
Create a new patient account.

**Endpoint:** `POST /api/doctors/patients`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "password": "SecurePassword123!",
  "phone": "+1234567892",
  "dateOfBirth": "1990-08-22",
  "gender": "female",
  "address": "456 Oak Ave, City, State",
  "emergencyContact": {
    "name": "Bob Smith",
    "phone": "+1234567893",
    "relationship": "husband"
  },
  "medicalHistory": ["Migraine"],
  "allergies": [],
  "currentMedications": ["Sumatriptan"]
}
```

**Required Fields:**
- `name` (string)
- `email` (string, unique)
- `password` (string, min 8 characters)

**Optional Fields:**
- `phone` (string)
- `dateOfBirth` (date)
- `gender` (enum: 'male', 'female', 'other')
- `address` (string)
- `emergencyContact` (object)
- `medicalHistory` (array of strings)
- `allergies` (array of strings)
- `currentMedications` (array of strings)

**Response:**
```json
{
  "success": true,
  "message": "Patient created successfully",
  "data": {
    "_id": "65f1234567890abcdef12347",
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "role": "patient",
    "createdBy": "65f1234567890abcdef12340",
    "isEmailVerified": false,
    "createdAt": "2026-02-16T10:00:00.000Z"
  }
}
```

**Error Response (Duplicate Email):**
```json
{
  "success": false,
  "message": "Failed to create patient: User with this email already exists"
}
```

---

### 8. Update Patient
Update patient information.

**Endpoint:** `PATCH /api/doctors/patients/:patientId`

**Example:** `PATCH /api/doctors/patients/65f1234567890abcdef12346`

**Request Body (all fields optional):**
```json
{
  "name": "John Doe Updated",
  "phone": "+1234567899",
  "address": "789 New St, City, State",
  "medicalHistory": ["Hypertension", "Diabetes Type 2", "High Cholesterol"],
  "allergies": ["Penicillin", "Sulfa drugs"],
  "currentMedications": ["Metformin", "Lisinopril", "Atorvastatin"]
}
```

**Updatable Fields:**
- `name` (string)
- `phone` (string)
- `dateOfBirth` (date)
- `gender` (enum: 'male', 'female', 'other')
- `address` (string)
- `emergencyContact` (object)
- `medicalHistory` (array of strings)
- `allergies` (array of strings)
- `currentMedications` (array of strings)

**Response:**
```json
{
  "success": true,
  "message": "Patient updated successfully",
  "data": {
    "_id": "65f1234567890abcdef12346",
    "name": "John Doe Updated",
    "email": "john@example.com",
    "phone": "+1234567899",
    "address": "789 New St, City, State",
    "medicalHistory": ["Hypertension", "Diabetes Type 2", "High Cholesterol"],
    "allergies": ["Penicillin", "Sulfa drugs"],
    "currentMedications": ["Metformin", "Lisinopril", "Atorvastatin"],
    "updatedAt": "2026-02-16T10:30:00.000Z"
  }
}
```

**Error Response (No Access):**
```json
{
  "success": false,
  "message": "Failed to update patient: Access denied: No appointment history with this patient"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Doctor role required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Patient not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to get patients list: <error details>"
}
```

---

## Usage Examples

### Using cURL

**Get Daily Appointments:**
```bash
curl -X GET http://localhost:5000/api/doctors/appointments/daily \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create Patient:**
```bash
curl -X POST http://localhost:5000/api/doctors/patients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "password": "SecurePassword123!",
    "phone": "+1234567892"
  }'
```

**Search Patients:**
```bash
curl -X GET "http://localhost:5000/api/doctors/patients?search=john&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using JavaScript (Fetch API)

```javascript
// Get doctor stats
const getStats = async () => {
  const response = await fetch('http://localhost:5000/api/doctors/stats', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data;
};

// Create patient
const createPatient = async (patientData) => {
  const response = await fetch('http://localhost:5000/api/doctors/patients', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patientData)
  });
  const data = await response.json();
  return data;
};

// Update patient
const updatePatient = async (patientId, updates) => {
  const response = await fetch(`http://localhost:5000/api/doctors/patients/${patientId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  const data = await response.json();
  return data;
};
```

---

## Access Control Rules

1. **Authentication Required**: All endpoints require a valid JWT token
2. **Doctor Role Required**: Only users with role='doctor' can access these endpoints
3. **Patient Access**: Doctors can only view/edit patients they have appointment history with
4. **Patient Creation**: Doctors can create new patients (tracked via createdBy field)
5. **Data Privacy**: Sensitive fields (password, tokens) are never returned in responses

---

## Best Practices

1. **Pagination**: Always use pagination for list endpoints to avoid performance issues
2. **Search**: Use the search parameter to filter large patient lists
3. **Error Handling**: Always check the `success` field in responses
4. **Token Refresh**: Implement token refresh logic for long-running sessions
5. **Validation**: Validate input data on the client side before sending requests
6. **Rate Limiting**: Be aware of rate limits (100 requests per 15 minutes by default)

---

## Notes

- All dates are in ISO 8601 format
- All times are in UTC
- Patient age is calculated automatically from dateOfBirth
- Passwords are automatically hashed before storage
- Email addresses are case-insensitive and must be unique
- Phone numbers should be in international format (+country code)
