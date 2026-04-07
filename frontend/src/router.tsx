import { createBrowserRouter } from 'react-router'
import App from './App.tsx'
import HomeLayout from './pages/HomeLayout.tsx'
import LandingPage from './pages/LandingPage.tsx'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import EventsPage from './pages/EventsPage.tsx'
import EventDetailPage from './pages/EventDetailPage.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import RegistrantLayout from './pages/registrant/RegistrantLayout.tsx'
import DashboardPage from './pages/registrant/DashboardPage.tsx'
import MyRegistrationsPage from './pages/registrant/MyRegistrationsPage.tsx'
import OrganizerLayout from './pages/organizer/OrganizerLayout.tsx'
import OrganizerDashboard from './pages/organizer/OrganizerDashboard.tsx'
import OrganizerEventsPage from './pages/organizer/OrganizerEventsPage.tsx'
import ManageEventPage from './pages/organizer/ManageEventPage.tsx'
import EventAttendeesPage from './pages/organizer/EventAttendeesPage.tsx'
import AdminLayout from './pages/admin/AdminLayout.tsx'
import AdminDashboardPage from './pages/admin/AdminDashboardPage.tsx'
import AdminUsersPage from './pages/admin/AdminUsersPage.tsx'
import AdminEventsPage from './pages/admin/AdminEventsPage.tsx'
import AdminRegistrationsPage from './pages/admin/AdminRegistrationsPage.tsx'
import AdminVenuesPage from './pages/admin/AdminVenuesPage.tsx'
import UserProfilePage from './pages/UserProfilePage.tsx'
import UnauthorizedPage from './pages/UnauthorizedPage.tsx'
import ErrorPage from './pages/ErrorPage.tsx'

export const appRoutes = [
  {
    element: <App />,
    children: [
      {
        element: <HomeLayout />,
        children: [
          { index: true, element: <LandingPage /> },
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
          {
            path: 'events',
            children: [
              { index: true, element: <EventsPage /> },
              { path: ':id', element: <EventDetailPage /> },
            ],
          },
          {
            path: 'dashboard',
            element: <ProtectedRoute allowedRoles={['REGISTRANT']} />,
            children: [
              {
                element: <RegistrantLayout />,
                children: [
                  { index: true, element: <DashboardPage /> },
                  { path: 'registrations', element: <MyRegistrationsPage /> },
                ],
              },
            ],
          },
          {
            path: 'organizer',
            element: <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']} />,
            children: [
              {
                element: <OrganizerLayout />,
                children: [
                  {
                    path: 'dashboard',
                    element: <ProtectedRoute allowedRoles={['ORGANIZER']} />,
                    children: [{ index: true, element: <OrganizerDashboard /> }],
                  },
                  {
                    path: 'events',
                    children: [
                      {
                        element: <ProtectedRoute allowedRoles={['ORGANIZER']} />,
                        children: [{ index: true, element: <OrganizerEventsPage /> }],
                      },
                      {
                        element: <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']} />,
                        children: [
                          { path: 'new', element: <ManageEventPage /> },
                          {
                            path: ':id',
                            children: [
                              { path: 'edit', element: <ManageEventPage /> },
                              { path: 'attendees', element: <EventAttendeesPage /> },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            path: 'admin',
            element: <ProtectedRoute allowedRoles={['ADMIN']} />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  { path: 'dashboard', element: <AdminDashboardPage /> },
                  { path: 'users', element: <AdminUsersPage /> },
                  { path: 'events', element: <AdminEventsPage /> },
                  { path: 'registrations', element: <AdminRegistrationsPage /> },
                  { path: 'venues', element: <AdminVenuesPage /> },
                ],
              },
            ],
          },
          {
            path: 'profile',
            element: <ProtectedRoute allowedRoles={['REGISTRANT', 'ORGANIZER', 'ADMIN']} />,
            children: [{ index: true, element: <UserProfilePage /> }],
          },
          { path: 'unauthorized', element: <UnauthorizedPage /> },
          { path: '*', element: <ErrorPage /> },
        ],
      },
    ],
  },
]

export const appRouter = createBrowserRouter(appRoutes)
