export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH_TOKEN: '/api/auth/refreshtoken',
    USER_PROFILE: '/api/auth/user/profile',
    USER_BY_ID: (id: number | string) => `/api/auth/user/${id}`,
    ADMIN_USERS: '/api/auth/admin/users',
    ADMIN_ORGANIZER: '/api/auth/admin/organizer',
    ADMIN_REGISTRANTS: '/api/auth/admin/registrants',
  },
  EVENTS: {
    BASE: '/api/events',
    BY_ID: (id: number | string) => `/api/events/${id}`,
  },
  REGISTRATIONS: {
    MY_REGISTRATIONS: '/api/registrations/my-registrations',
    REGISTER: '/api/registrations/register',
    CANCEL: (registrationId: number | string) => `/api/registrations/${registrationId}/cancel`,
    BY_EVENT: (eventId: number | string) => `/api/registrations/event/${eventId}`,
    ADMIN_ALL: '/api/registrations/admin/all',
  },
  VENUES: {
    BASE: '/api/venues',
  },
  PAYMENTS: {
    CREATE_ORDER: '/api/payments/create-order',
  },
  RECEIPTS: {
    BY_REGISTRATION: (registrationId: number | string) => `/api/receipts/${registrationId}`,
  }
}
