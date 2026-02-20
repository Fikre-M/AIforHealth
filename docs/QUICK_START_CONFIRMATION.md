# Quick Start: Appointment Confirmation System

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (2 minutes)

```bash
cd backend
npm install nodemailer twilio
npm install --save-dev @types/nodemailer
```

Or use the provided script:
- **Windows**: Double-click `backend/install-confirmation-deps.bat`
- **Linux/Mac**: Run `./backend/install-confirmation-deps.sh`

### Step 2: Configure Environment (2 minutes)

Edit `backend/.env` and add:

```env
# Frontend URL (required)
FRONTEND_URL=http://localhost:5173

# Email Service (optional - for testing, use placeholder)
SENDGRID_API_KEY=placeholder_key_for_now
FROM_EMAIL=noreply@aiforhealth.com
FROM_NAME=AI for Health

# SMS Service (optional - for testing, leave empty)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### Step 3: Test It (1 minute)

Start the backend:
```bash
npm run dev
```

Book an appointment via your frontend or API:
```bash
curl -X POST http://localhost:5000/api/v1/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctor": "DOCTOR_ID",
    "appointmentDate": "2024-12-25T10:00:00Z",
    "duration": 30,
    "type": "consultation",
    "reason": "Regular checkup"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "appointment": { ... },
    "confirmationNumber": "APT-L8X9K2-A7B3C9",
    "message": "Appointment created successfully. Confirmation sent to your email and phone."
  }
}
```

✅ **You should see a confirmation number!**

## 📧 Enable Email Confirmations (Optional)

### Get SendGrid API Key (Free - 100 emails/day)

1. Sign up at https://sendgrid.com
2. Go to Settings > API Keys
3. Click "Create API Key"
4. Name it "AI for Health"
5. Select "Full Access" or "Mail Send"
6. Copy the key
7. Update `.env`:
   ```env
   SENDGRID_API_KEY=SG.your_actual_key_here
   ```
8. Restart backend: `npm run dev`

Now emails will be sent automatically! 📧

## 📱 Enable SMS Confirmations (Optional)

### Get Twilio Credentials (Free trial - $15 credit)

1. Sign up at https://twilio.com
2. From dashboard, copy:
   - Account SID
   - Auth Token
3. Go to Phone Numbers > Manage > Buy a number
4. Get a phone number (free with trial)
5. Update `.env`:
   ```env
   TWILIO_ACCOUNT_SID=your_sid_here
   TWILIO_AUTH_TOKEN=your_token_here
   TWILIO_PHONE_NUMBER=+1234567890
   ```
6. Restart backend: `npm run dev`

Now SMS will be sent automatically! 📱

## ✅ What Works Right Now

Even without API keys configured:
- ✅ Confirmation numbers are generated
- ✅ API returns confirmation data
- ✅ Appointments are saved to database
- ✅ System logs notification attempts

With API keys configured:
- ✅ Email confirmations sent
- ✅ Calendar invites attached
- ✅ SMS confirmations sent
- ✅ Automatic reminders (future feature)

## 🎨 Frontend Implementation

See `docs/FRONTEND_CONFIRMATION_GUIDE.md` for complete React component with:
- Confirmation page display
- PDF download
- Calendar download
- Print functionality
- Share functionality
- QR code generation

## 📚 Full Documentation

- `docs/CONFIRMATION_SYSTEM_SUMMARY.md` - Complete overview
- `docs/APPOINTMENT_CONFIRMATION_IMPLEMENTATION.md` - Backend details
- `docs/FRONTEND_CONFIRMATION_GUIDE.md` - Frontend implementation
- `docs/APPOINTMENT_CONFIRMATION_GUIDE.md` - Best practices

## 🐛 Troubleshooting

### "Email not received"
- Check SENDGRID_API_KEY is correct
- Check spam folder
- Verify FROM_EMAIL is configured
- Check backend logs for errors

### "SMS not received"
- Check Twilio credentials are correct
- Verify phone number format (+1234567890)
- Check patient has phone number in database
- Verify Twilio trial restrictions (can only send to verified numbers)

### "Confirmation number not showing"
- Check backend is running
- Verify appointment was created successfully
- Check API response includes confirmationNumber field

## 💡 Tips

1. **Start without API keys** - System works fine, just no emails/SMS
2. **Add SendGrid first** - Easier to set up than Twilio
3. **Test with your own email/phone** - Verify it works before production
4. **Check logs** - Backend logs all notification attempts
5. **Use placeholder keys** - System handles missing keys gracefully

## 🎯 Next Steps

1. ✅ Install dependencies
2. ✅ Configure FRONTEND_URL
3. ✅ Test confirmation numbers work
4. ⏳ Get SendGrid API key (optional)
5. ⏳ Get Twilio credentials (optional)
6. ⏳ Implement frontend confirmation page
7. ⏳ Test end-to-end flow

## 🚀 You're Ready!

The confirmation system is now set up. Book an appointment and see the confirmation number in action!

For questions, check the full documentation in the `docs/` folder.
