# Swagger UI Testing Guide

## Quick Test

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```

### 2. Access Swagger UI
Open your browser and navigate to:
```
http://localhost:5000/api-docs
```

### 3. Verify Documentation
You should see:
- ✅ "AI for Health API" title
- ✅ API version 1.0.0
- ✅ Comprehensive description with sections
- ✅ 9 tags (Authentication, Doctors, Patients, etc.)
- ✅ Multiple endpoints under each tag
- ✅ "Authorize" button in top right

### 4. Test Authentication Flow

#### Step 1: Register a User
1. Expand "Authentication" tag
2. Click on `POST /auth/register`
3. Click "Try it out"
4. Use this example:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "SecurePassword123!",
  "role": "patient"
}
```
5. Click "Execute"
6. Verify response (should be 201 Created)
7. Copy the `token` from the response

#### Step 2: Authorize
1. Click "Authorize" button (top right)
2. Enter: `Bearer <paste-your-token-here>`
3. Click "Authorize"
4. Click "Close"

#### Step 3: Test Protected Endpoint
1. Expand "Authentication" tag
2. Click on `GET /auth/profile`
3. Click "Try it out"
4. Click "Execute"
5. Verify response (should be 200 OK with user data)

### 5. Test Doctor Endpoints (if you have a doctor account)

#### Login as Doctor
1. `POST /auth/login`
```json
{
  "email": "doctor@example.com",
  "password": "password"
}
```
2. Copy token and authorize again

#### Test Doctor Stats
1. `GET /doctors/stats`
2. Click "Try it out"
3. Click "Execute"
4. Verify response with statistics

#### Test Patients List
1. `GET /doctors/patients`
2. Add query parameters:
   - page: 1
   - limit: 10
   - search: (optional)
3. Click "Execute"
4. Verify paginated response

### 6. Test Appointment Endpoints

#### Create Appointment
1. `POST /appointments`
2. Use example:
```json
{
  "patientId": "65f1234567890abcdef12345",
  "doctorId": "65f1234567890abcdef12346",
  "appointmentDate": "2024-03-15T10:00:00.000Z",
  "duration": 30,
  "type": "consultation",
  "reason": "Regular checkup"
}
```
3. Click "Execute"
4. Verify response (201 Created)

#### Get Appointments
1. `GET /appointments`
2. Add filters:
   - status: scheduled
   - page: 1
   - limit: 10
3. Click "Execute"
4. Verify paginated response

### 7. Verify Schemas
1. Scroll to bottom of page
2. Expand "Schemas" section
3. Verify these schemas exist:
   - Error
   - Pagination
   - User
   - RegisterRequest
   - LoginRequest
   - AuthResponse
   - Appointment
   - CreateAppointmentRequest
   - HealthMetric

### 8. Test Error Responses

#### Test 401 Unauthorized
1. Click "Authorize" and "Logout"
2. Try `GET /auth/profile` without token
3. Verify 401 error response

#### Test 400 Bad Request
1. Try `POST /auth/register` with invalid data:
```json
{
  "name": "A",
  "email": "invalid-email",
  "password": "123"
}
```
2. Verify 400 error response

#### Test 404 Not Found
1. Try `GET /appointments/invalid-id`
2. Verify 404 error response

## Expected Results

### ✅ Swagger UI Loads Successfully
- Page loads without errors
- All sections visible
- Styling applied correctly

### ✅ All Endpoints Documented
- Authentication (8 endpoints)
- Doctors (6 endpoints)
- Appointments (5 endpoints)
- Monitoring (1 endpoint)

### ✅ Interactive Testing Works
- Can try out endpoints
- Can authenticate
- Can see responses
- Can view schemas

### ✅ Examples Are Helpful
- Request examples provided
- Response examples shown
- Error examples included

### ✅ Documentation Is Clear
- Descriptions are detailed
- Parameters explained
- Security requirements shown
- Rate limits documented

## Troubleshooting

### Swagger UI Not Loading
```bash
# Check if server is running
curl http://localhost:5000/health

# Check Swagger JSON
curl http://localhost:5000/api-docs/swagger.json

# Check for errors in console
npm run dev
```

### 401 Unauthorized Errors
- Verify token is valid
- Check token format: `Bearer <token>`
- Ensure token hasn't expired
- Try logging in again

### 404 Not Found
- Verify endpoint URL is correct
- Check API version in URL (/api/v1)
- Ensure route is registered

### TypeScript Errors
```bash
# Check for errors
cd backend
npm run type-check

# If errors, check these files:
# - src/config/swagger.ts
# - src/config/swagger.enhanced.ts
# - src/docs/api-paths.ts
```

## Additional Testing

### Test with cURL
```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"SecurePassword123!","role":"patient"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePassword123!"}'

# Get Profile (replace TOKEN)
curl -X GET http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

### Test with Postman
1. Import OpenAPI spec:
   - URL: `http://localhost:5000/api-docs/swagger.json`
2. Set environment variables:
   - baseUrl: `http://localhost:5000/api/v1`
   - token: `<your-jwt-token>`
3. Test endpoints

### Test Rate Limiting
```bash
# Send multiple requests quickly
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done

# Should see 429 after 5 attempts
```

## Success Criteria

- ✅ Swagger UI loads at `/api-docs`
- ✅ All endpoints are documented
- ✅ Can authenticate and test protected endpoints
- ✅ Request/response examples are accurate
- ✅ Error responses match documentation
- ✅ Schemas are complete and accurate
- ✅ Rate limiting works as documented
- ✅ No TypeScript errors
- ✅ No console errors

## Next Steps

After verifying Swagger UI works:

1. **Add JSDoc to More Routes**
   - Follow pattern in `authRoutes.ts`
   - Add to all route files

2. **Export Postman Collection**
   - Use Swagger UI export feature
   - Or manually create from Swagger JSON
   - Share with team

3. **Add More Examples**
   - Different scenarios
   - Edge cases
   - Error conditions

4. **Update Documentation**
   - Keep in sync with code
   - Add new endpoints
   - Update examples

---

**Last Updated**: February 16, 2026
**Status**: Ready for Testing
