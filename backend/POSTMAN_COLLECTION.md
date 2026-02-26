# Postman Collection Generation

## Manual Generation from Swagger

Since the automated Postman collection generation script has been removed to avoid unnecessary dependencies, you can manually create a Postman collection from the Swagger documentation:

### Option 1: Import from Swagger UI
1. Start the backend server: `npm run dev`
2. Open Swagger UI: `http://localhost:5000/api-docs`
3. Copy the Swagger JSON URL: `http://localhost:5000/api-docs/swagger.json`
4. In Postman:
   - Click "Import"
   - Select "Link"
   - Paste the Swagger JSON URL
   - Click "Continue" and "Import"

### Option 2: Export from Swagger UI
1. Open Swagger UI: `http://localhost:5000/api-docs`
2. Look for export options in the Swagger UI interface
3. Download the collection file
4. Import into Postman

### Option 3: Manual Creation
1. Create a new collection in Postman
2. Add environment variables:
   - `baseUrl`: `http://localhost:5000/api`
   - `auth_token`: (to be filled after login)
3. Manually add requests based on the API documentation

## Environment Setup

Create a Postman environment with these variables:
- `baseUrl`: `http://localhost:5000/api`
- `auth_token`: (empty initially, will be set after authentication)

## Authentication Flow

1. First, make a POST request to `/auth/login` with credentials
2. Copy the returned token
3. Set the `auth_token` environment variable
4. Use `Bearer {{auth_token}}` in Authorization headers for protected routes

## Future Automation

If you need automated Postman collection generation in the future, you can:
1. Install the postman-collection package: `npm install postman-collection`
2. Create a new script to generate collections from your OpenAPI/Swagger specification
3. Add it to package.json scripts for easy execution