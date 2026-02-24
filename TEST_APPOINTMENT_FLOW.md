# Test Appointment Flow

## ✅ What I Fixed

1. **API Adapter Response Handling** - Updated to handle different response formats from backend
2. **Appointment Service** - Added proper error handling and data transformation
3. **Better Logging** - Added console logs to track API calls

## 🧪 Test the Full Flow

### Step 1: Register a New User
```powershell
$body = @{
    name = "Test Patient"
    email = "testpatient@example.com"
    password = "Test123!@#"
    role = "patient"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing

$result = $response.Content | ConvertFrom-Json
$token = $result.data.tokens.accessToken
$userId = $result.data.user._id

Write-Host "✅ User registered successfully"
Write-Host "User ID: $userId"
Write-Host "Token: $token"
```

### Step 2: Create an Appointment
```powershell
# Use the token from Step 1
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$appointmentBody = @{
    doctor = "69826cc6fb8c929652dc8305"  # Existing doctor ID
    appointmentDate = "2026-02-27T14:00:00.000Z"
    duration = 30
    type = "consultation"
    reason = "Regular checkup"
} | ConvertTo-Json

$apptResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/appointments" -Method POST -Body $appointmentBody -Headers $headers -UseBasicParsing

$apptResult = $apptResponse.Content | ConvertFrom-Json
$appointmentId = $apptResult.data.appointment._id
$confirmationNumber = $apptResult.data.confirmationNumber

Write-Host "✅ Appointment created successfully"
Write-Host "Appointment ID: $appointmentId"
Write-Host "Confirmation Number: $confirmationNumber"
```

### Step 3: Fetch the Appointment
```powershell
# Use the same token and appointment ID from previous steps
$getResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/v1/appointments/$appointmentId" -Method GET -Headers $headers -UseBasicParsing

$getResult = $getResponse.Content | ConvertFrom-Json
Write-Host "✅ Appointment fetched successfully"
Write-Host ($getResult | ConvertTo-Json -Depth 5)
```

## 🌐 Test from Frontend

### 1. Open Browser DevTools (F12)

### 2. Check Console for Logs
You should see:
```
🔧 API Mode: REAL API
🔄 Creating appointment via API...
✅ Appointment created successfully: {...}
🔄 Fetching appointment by ID: 699e2355a04f8370a8866cdf
✅ Appointment fetched successfully: {...}
```

### 3. Check Network Tab
- Filter by "Fetch/XHR"
- Look for requests to `http://localhost:5000/api/v1/appointments`
- Check if `Authorization: Bearer <token>` header is present
- Check response status (should be 200 or 201)

### 4. Check LocalStorage
In Console, run:
```javascript
console.log('Token:', localStorage.getItem('accessToken'));
console.log('User:', localStorage.getItem('user'));
```

## 🔍 Common Issues & Solutions

### Issue: "Failed to load appointment details"

**Cause 1: Token not stored**
```javascript
// Check if token exists
if (!localStorage.getItem('accessToken')) {
  console.error('No access token found!');
}
```

**Solution:** Make sure registration/login stores the token:
```javascript
localStorage.setItem('accessToken', tokens.accessToken);
localStorage.setItem('refreshToken', tokens.refreshToken);
localStorage.setItem('user', JSON.stringify(user));
```

**Cause 2: Wrong appointment ID format**
- Backend uses MongoDB ObjectId (24 hex characters)
- Frontend might be using different ID format

**Solution:** Check the ID being passed:
```javascript
console.log('Appointment ID:', appointmentId);
console.log('ID length:', appointmentId.length); // Should be 24
```

**Cause 3: CORS or Network Error**
```javascript
// Check for CORS errors in console
// Should see: Access-Control-Allow-Origin header
```

**Solution:** Backend CORS is configured for `http://localhost:5173`
- Make sure frontend is running on this exact port
- Check `.env` file: `VITE_API_BASE_URL=http://localhost:5000/api/v1`

### Issue: Appointment created but can't fetch it

**Check the response format:**
```javascript
// After creating appointment
console.log('Created appointment:', response);
console.log('Appointment ID:', response.appointment._id);
console.log('Confirmation:', response.confirmationNumber);
```

**Navigate to confirmation page:**
```javascript
// Should navigate to: /app/appointments/{appointmentId}/confirmation
// Not: /app/appointments/{confirmationNumber}/confirmation
```

## ✅ Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] MongoDB running and connected
- [ ] User can register successfully
- [ ] Token is stored in localStorage
- [ ] Appointment can be created
- [ ] Appointment is saved to database
- [ ] Appointment can be fetched by ID
- [ ] Confirmation page loads without errors

## 🆘 Still Not Working?

Run this diagnostic:
```javascript
// In browser console
const diagnose = async () => {
  console.log('=== DIAGNOSTIC START ===');
  
  // Check environment
  console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('Use Mock API:', import.meta.env.VITE_USE_MOCK_API);
  
  // Check auth
  const token = localStorage.getItem('accessToken');
  console.log('Has Token:', !!token);
  console.log('Token:', token?.substring(0, 20) + '...');
  
  // Check user
  const user = localStorage.getItem('user');
  console.log('Has User:', !!user);
  if (user) console.log('User:', JSON.parse(user));
  
  // Test API connection
  try {
    const response = await fetch('http://localhost:5000/api/v1/appointments', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('API Status:', response.status);
    console.log('API Response:', await response.json());
  } catch (error) {
    console.error('API Error:', error);
  }
  
  console.log('=== DIAGNOSTIC END ===');
};

diagnose();
```

Share the output of this diagnostic if you still have issues!
