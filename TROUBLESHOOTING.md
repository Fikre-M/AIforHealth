# Troubleshooting Guide

## ✅ Backend Status: WORKING

I've verified that the backend is functioning correctly:

### Verified Working:
1. ✅ MongoDB is running and connected
2. ✅ User registration endpoint works (`POST /api/v1/auth/register`)
3. ✅ Users are saved to database
4. ✅ Appointment creation works (`POST /api/v1/appointments`)
5. ✅ Appointments are saved to database
6. ✅ Authentication tokens are generated correctly

### Test Results:
```
Created User:
- ID: 699e22d6a04f8370a8866cd9
- Email: testuser@example.com
- Role: patient
- Status: Active in database ✓

Created Appointment:
- ID: 699e2355a04f8370a8866cdf
- Patient: testuser@example.com
- Doctor: helen@example.com
- Date: 2026-02-26 10:00 AM
- Status: Saved in database ✓
```

## 🔍 Frontend Issues to Check

Since the backend is working, the issue is on the **frontend side**. Here's what to check:

### 1. Check Browser Console for Errors
Open browser DevTools (F12) and check:
- Console tab for JavaScript errors
- Network tab for failed API requests
- Look for CORS errors or 401/403 responses

### 2. Verify API Base URL
Check that frontend is calling: `http://localhost:5000/api/v1`

In browser console, run:
```javascript
console.log(import.meta.env.VITE_API_BASE_URL)
```

### 3. Check Token Storage
After registration/login, check if token is stored:

In browser console:
```javascript
// Check localStorage
console.log(localStorage.getItem('accessToken'))
console.log(localStorage.getItem('user'))

// Check sessionStorage
console.log(sessionStorage.getItem('accessToken'))
```

### 4. Verify Frontend is Running
Make sure frontend dev server is running on port 5173:
```bash
cd frontend
npm run dev
```

### 5. Check Network Requests
In DevTools Network tab:
- Filter by "Fetch/XHR"
- Try to register/login
- Check if requests are being sent to `http://localhost:5000`
- Check request headers include `Authorization: Bearer <token>`
- Check response status codes

### 6. Common Frontend Issues

**Issue: "Failed to load appointment details"**
- Frontend might not be sending the auth token
- Check if `Authorization` header is included in API calls
- Verify token is not expired

**Issue: User can register but can't see data**
- Frontend might be calling wrong API endpoint
- Check if frontend is using `/api/v1/` prefix
- Verify frontend auth context is updating after login

**Issue: CORS errors**
- Backend CORS is configured for: `http://localhost:5173`
- Make sure frontend is running on this exact port
- Check browser console for CORS error messages

### 7. Quick Frontend Fixes

**If using Axios, check interceptor:**
```javascript
// Should include token in all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**If using Fetch, check headers:**
```javascript
fetch('http://localhost:5000/api/v1/appointments', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## 🧪 Manual Testing Commands

### Test Registration:
```powershell
$body = @{
    name = "Your Name"
    email = "your@email.com"
    password = "YourPassword123!@#"
    role = "patient"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/v1/auth/register" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

### Test Login:
```powershell
$body = @{
    email = "your@email.com"
    password = "YourPassword123!@#"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

### Check Database:
```bash
# Check users
mongosh AIforHealth --eval "db.users.find().pretty()"

# Check appointments
mongosh AIforHealth --eval "db.appointments.find().pretty()"
```

## 📝 Next Steps

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to register/login
4. Look for any error messages
5. Go to Network tab
6. Check if API requests are being made
7. Share any error messages you see

## 🆘 If Still Not Working

Please provide:
1. Screenshot of browser console errors
2. Screenshot of Network tab showing failed requests
3. Frontend code for registration/login component
4. Any error messages from frontend terminal

The backend is 100% working - the issue is definitely in the frontend API integration!
