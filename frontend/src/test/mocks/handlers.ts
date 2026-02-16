import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:5000/api/v1';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/login`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'patient',
        },
        token: 'mock-jwt-token',
      },
    });
  }),

  http.post(`${API_BASE_URL}/auth/register`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          role: 'patient',
        },
        token: 'mock-jwt-token',
      },
    });
  }),

  http.get(`${API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'patient',
      },
    });
  }),

  // Patient endpoints
  http.get(`${API_BASE_URL}/patients/:id`, ({ params }) => {
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        name: 'Test Patient',
        email: 'patient@example.com',
        dateOfBirth: '1990-01-01',
        phone: '123-456-7890',
      },
    });
  }),

  // Appointment endpoints
  http.get(`${API_BASE_URL}/appointments`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          patientId: '1',
          doctorId: '1',
          date: '2024-03-20',
          time: '10:00',
          status: 'scheduled',
          reason: 'Regular checkup',
        },
      ],
    });
  }),

  http.post(`${API_BASE_URL}/appointments`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '2',
        patientId: '1',
        doctorId: '1',
        date: '2024-03-21',
        time: '14:00',
        status: 'scheduled',
        reason: 'Follow-up',
      },
    });
  }),

  // Doctor endpoints
  http.get(`${API_BASE_URL}/doctors`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          id: '1',
          name: 'Dr. Smith',
          specialty: 'Cardiology',
          email: 'dr.smith@example.com',
          phone: '123-456-7890',
        },
      ],
    });
  }),

  // AI Assistant endpoints
  http.post(`${API_BASE_URL}/ai-assistant/chat`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        message: 'This is a mock AI response',
        timestamp: new Date().toISOString(),
      },
    });
  }),
];
