import './App.css'
import { ToastContainer } from 'react-toastify'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import LandingPage from './pages/LandingPage.tsx'
import HomeLayout from './pages/HomeLayout.tsx'
import EventsPage from './pages/EventsPage.tsx'
import EventDetailPage from './pages/EventDetailPage.tsx'
import ProtectedRoute from './Components/ProtectedRoute.tsx'
import DashboardPage from './pages/registrant/DashboardPage.tsx'
import MyRegistrationsPage from './pages/registrant/MyRegistrationsPage.tsx'
import OrganizerDashboard from './pages/organizer/OrganizerDashboard.tsx'
import OrganizerEventsPage from './pages/organizer/OrganizerEventsPage.tsx'
import ManageEventPage from './pages/organizer/ManageEventPage.tsx'
import EventAttendeesPage from './pages/organizer/EventAttendeesPage.tsx'

import AdminDashboardPage from './pages/admin/AdminDashboardPage.tsx'
import AdminUsersPage from './pages/admin/AdminUsersPage.tsx'
import AdminEventsPage from './pages/admin/AdminEventsPage.tsx'
import AdminRegistrationsPage from './pages/admin/AdminRegistrationsPage.tsx'
import AdminVenuesPage from './pages/admin/AdminVenuesPage.tsx'
import UserProfilePage from './pages/UserProfilePage.tsx'
import UnauthorizedPage from './pages/UnauthorizedPage.tsx'
import ErrorPage from './pages/ErrorPage.tsx'
function App() {
  return (
    <div>
      <ToastContainer
        position='top-right'
        autoClose={2000}
        theme='light'
      />

      <Routes>
        <Route element={<HomeLayout />}>
          <Route path='/' element={<LandingPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/events' element={<EventsPage />} />
          <Route path='/events/:id' element={<EventDetailPage />} />

          {/* Protected Routes for Registrants */}
          <Route element={<ProtectedRoute allowedRoles={['REGISTRANT']} />}>
            <Route path='/dashboard' element={<DashboardPage />} />
            <Route path='/dashboard/registrations' element={<MyRegistrationsPage />} />
          </Route>

          {/* Protected Routes for Organizers */}
          <Route element={<ProtectedRoute allowedRoles={['ORGANIZER']} />}>
            <Route path='/organizer/dashboard' element={<OrganizerDashboard />} />
            <Route path='/organizer/events' element={<OrganizerEventsPage />} />
          </Route>

          {/* Shared Routes: Organizers & Admins */}
          <Route element={<ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']} />}>
            <Route path='/organizer/events/new' element={<ManageEventPage />} />
            <Route path='/organizer/events/:id/edit' element={<ManageEventPage />} />
            <Route path='/organizer/events/:id/attendees' element={<EventAttendeesPage />} />
          </Route>

          {/* Protected Routes for Admin */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path='/admin/dashboard' element={<AdminDashboardPage />} />
            <Route path='/admin/users' element={<AdminUsersPage />} />
            <Route path='/admin/events' element={<AdminEventsPage />} />
            <Route path='/admin/registrations' element={<AdminRegistrationsPage />} />
            <Route path='/admin/venues' element={<AdminVenuesPage />} />
          </Route>
          {/* Shared Route: Profile Page for all authenticated users */}
          <Route element={<ProtectedRoute allowedRoles={['REGISTRANT', 'ORGANIZER', 'ADMIN']} />}>
            <Route path='/profile' element={<UserProfilePage />} />
          </Route>

          {/* Fallbacks */}
          <Route path='/unauthorized' element={<UnauthorizedPage />} />
          <Route path='*' element={<ErrorPage />} />
        </Route>
      </Routes>





    </div>
  )
}

export default App
