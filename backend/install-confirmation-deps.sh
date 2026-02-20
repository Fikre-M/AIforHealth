#!/bin/bash

# Install dependencies for appointment confirmation system
echo "Installing appointment confirmation dependencies..."

npm install nodemailer twilio
npm install --save-dev @types/nodemailer

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure your .env file with SendGrid and Twilio credentials"
echo "2. See docs/APPOINTMENT_CONFIRMATION_IMPLEMENTATION.md for setup guide"
echo "3. Test by booking an appointment"
