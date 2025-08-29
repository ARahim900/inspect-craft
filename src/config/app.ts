export const APP_CONFIG = {
  name: 'Solution Property Inspection System',
  shortName: 'Solution Property',
  version: '1.0.0',
  description: 'Professional property inspection management system for comprehensive reporting and client management',
  company: {
    name: 'Solution Property',
    website: 'https://solutionproperty.om',
    email: 'info@solutionproperty.om',
    phone: '+968 XXXX XXXX',
    address: 'Muscat, Sultanate of Oman',
    logo: '/logo.jpeg'
  },
  features: {
    inspections: 'Complete property inspection management',
    reports: 'Professional bilingual reporting system',
    scheduling: 'Advanced appointment scheduling',
    billing: 'Automated invoice generation',
    clientManagement: 'Comprehensive client relationship management',
    analytics: 'Business intelligence dashboard'
  },
  technical: {
    buildDate: new Date().toISOString(),
    environment: import.meta.env.MODE,
    supportedFormats: ['PDF', 'CSV', 'Print'],
    languages: ['English', 'Arabic'],
    currency: 'OMR'
  },
  legal: {
    termsOfService: '/terms',
    privacyPolicy: '/privacy',
    copyright: `© ${new Date().getFullYear()} Solution Property. All rights reserved.`
  }
};

export const SYSTEM_SETTINGS = {
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100
  },
  uploads: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    compressionQuality: 0.8
  },
  reports: {
    defaultTemplate: 'professional',
    maxPhotosPerItem: 5,
    watermark: true
  },
  notifications: {
    autoSave: true,
    soundEnabled: false,
    position: 'top-right' as const
  },
  security: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    maxLoginAttempts: 5,
    passwordMinLength: 8
  }
};

// Professional error codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_001',
  STORAGE_ERROR: 'STORAGE_002', 
  VALIDATION_ERROR: 'VALIDATION_003',
  PERMISSION_ERROR: 'PERMISSION_004',
  FILE_UPLOAD_ERROR: 'UPLOAD_005',
  REPORT_GENERATION_ERROR: 'REPORT_006'
};

// Success messages
export const SUCCESS_MESSAGES = {
  INSPECTION_SAVED: 'Inspection report saved successfully',
  INVOICE_GENERATED: 'Invoice generated and sent to client',
  SCHEDULE_CREATED: 'Appointment scheduled successfully',
  CLIENT_ADDED: 'Client added to your database',
  REPORT_EXPORTED: 'Report exported successfully'
};

// Professional themes
export const THEMES = {
  light: {
    name: 'Professional Light',
    colors: {
      primary: '#1e40af',
      secondary: '#64748b',
      accent: '#3b82f6',
      background: '#ffffff',
      surface: '#f8fafc'
    }
  },
  dark: {
    name: 'Professional Dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#94a3b8',
      accent: '#3b82f6',
      background: '#0f172a',
      surface: '#1e293b'
    }
  }
};

// Application routes
export const ROUTES = {
  dashboard: '/',
  inspections: '/inspections',
  newInspection: '/inspections/new',
  editInspection: (id: string) => `/inspections/${id}/edit`,
  viewInspection: (id: string) => `/inspections/${id}`,
  reports: '/reports',
  schedules: '/schedules',
  billing: '/billing',
  createInvoice: '/billing/create',
  clients: '/clients',
  settings: '/settings',
  profile: '/profile'
};