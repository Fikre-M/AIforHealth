# Mock API System

This directory contains a mock API system that allows the application to work without a real backend during development.

## How It Works

### Environment-Based Switching
- **Development**: Uses mock API by default (`VITE_USE_MOCK_API=true`)
- **Production**: Uses real API (`VITE_USE_MOCK_API=false`)

### Architecture
```
Service Layer → API Adapter → Mock API | Real API
```

1. **Service Layer** (`authService.ts`, `appointmentService.ts`, etc.)
   - Business logic and error handling
   - Uses `apiAdapter` instead of direct API calls

2. **API Adapter** (`apiAdapter.ts`)
   - Routes calls to mock or real API based on environment
   - Provides unified interface for both modes

3. **Mock API** (`mockApi.ts`)
   - Simulates real API responses with realistic data
   - Includes network delays and error simulation
   - Maintains in-memory state during session

## Configuration

### Environment Variables
```bash
# Development (uses mock API)
VITE_USE_MOCK_API=true

# Production (uses real API)
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://your-production-api.com/api/v1
```

### Files
- `.env` - Development configuration (mock API enabled)
- `.env.production` - Production configuration (real API)

## Mock Data

The mock API includes realistic sample data for:
- **Users**: Patient and doctor accounts
- **Appointments**: Scheduled, completed, and cancelled appointments
- **Notifications**: Various notification types with different priorities
- **Authentication**: Login/register flows with validation

### Default Test Accounts
```javascript
// Patient account
email: 'patient@example.com'
password: 'password123'

// Doctor account  
email: 'doctor@example.com'
password: 'password123'
```

## Usage

### Switching Between APIs

**Development with Mock API:**
```bash
npm run dev
# Uses mock API automatically
```

**Development with Real API:**
```bash
VITE_USE_MOCK_API=false npm run dev
# Forces real API in development
```

**Production:**
```bash
npm run build
# Uses real API automatically
```

### Adding New Mock Endpoints

1. Add the endpoint to `mockApi.ts`:
```typescript
export const mockApi = {
  // ... existing endpoints
  
  newEndpoint: {
    async getData(): Promise<DataType> {
      await delay();
      return mockData;
    }
  }
};
```

2. Add to `apiAdapter.ts`:
```typescript
export const apiAdapter = {
  // ... existing adapters
  
  newEndpoint: {
    getData: config.useMockApi 
      ? mockApi.newEndpoint.getData 
      : () => api.get('/new-endpoint').then(res => res.data)
  }
};
```

3. Update your service to use the adapter:
```typescript
import apiAdapter from './apiAdapter';

export const myService = {
  async getData() {
    return await apiAdapter.newEndpoint.getData();
  }
};
```

## Features

### Realistic Simulation
- Network delays (500-1000ms)
- Error simulation (2% failure rate)
- Proper HTTP status codes
- Consistent response formats

### Development Tools
- API mode indicator in development
- Console logging of mock API calls
- Persistent session state

### Easy Migration
- Change one environment variable to switch APIs
- No code changes required
- Maintains all existing functionality

## Best Practices

1. **Keep Mock Data Realistic**: Use data that matches your real API structure
2. **Test Both Modes**: Regularly test with both mock and real APIs
3. **Update Mock Data**: Keep mock responses in sync with API changes
4. **Error Handling**: Test error scenarios with mock API
5. **Performance**: Mock API should simulate real API timing

## Troubleshooting

### Mock API Not Working
- Check `VITE_USE_MOCK_API` environment variable
- Verify `config.useMockApi` in browser console
- Look for API mode indicator in development

### Real API Not Working
- Set `VITE_USE_MOCK_API=false`
- Check `VITE_API_BASE_URL` configuration
- Verify backend is running and accessible

### Mixed Responses
- Clear browser cache and localStorage
- Restart development server
- Check for cached service worker