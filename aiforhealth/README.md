# AIforHealth - Next-Generation Healthcare Platform

A modern, AI-powered healthcare and medical appointment system built with Vite + React + TypeScript.

## 🚀 Features

- **Role-based Dashboards** - Patient, Doctor, and Admin interfaces
- **AI Health Assistant** - Symptom checker and health guidance (frontend only)
- **Smart Appointment Booking** - Streamlined scheduling system
- **Mobile-first Design** - Responsive healthcare UI
- **PWA Ready** - Progressive Web App capabilities
- **Accessibility Compliant** - WCAG guidelines followed

## 🏗️ Architecture

```
src/
├── components/          # Shared UI components
│   └── layout/         # Layout components (Header, Sidebar)
├── features/           # Feature-based modules
│   ├── auth/          # Authentication
│   ├── dashboard/     # Role-based dashboards
│   └── chat/          # AI assistant chat
├── services/          # API service layer (mock data)
├── types/             # TypeScript type definitions
└── config/            # Environment configuration
```

## 🛠️ Tech Stack

- **Frontend**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **State**: React Context API
- **Build**: Vite with TypeScript

## 📦 Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 🔐 Demo Accounts

Use these credentials to test different user roles:

- **Patient**: `patient@example.com` / `password`
- **Doctor**: `doctor@example.com` / `password`
- **Admin**: `admin@example.com` / `password`

## 🎯 Key Pages

- **Landing Page** - Healthcare platform introduction
- **Login/Register** - Authentication with role selection
- **Patient Dashboard** - Appointment booking, health overview
- **Doctor Dashboard** - Patient management, schedule
- **AI Chat** - Health assistant with medical disclaimer
- **Profile & Settings** - User management

## ⚠️ Medical Disclaimer

This application is for demonstration purposes only. The AI assistant provides general health information and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical concerns.

## 🚀 Deployment

```bash
npm run build
npm run preview
```

## 📱 PWA Features

- Offline capability
- App-like experience
- Push notifications (ready for backend integration)
- Responsive design

## 🔮 Future Backend Integration

The app is designed with a clean API service layer (`src/services/api.ts`) that currently uses mock data. Replace with real API calls when backend is ready.

## 📄 License

MIT License - Built for healthcare innovation.