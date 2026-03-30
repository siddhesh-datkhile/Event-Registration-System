import './App.css'
import { ToastContainer } from 'react-toastify'
import { Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage.tsx'
import RegisterPage from './pages/RegisterPage.tsx'
import LandingPage from './pages/LandingPage.tsx'
import HomeLayout from './pages/HomeLayout.tsx'
import EventsPage from './pages/EventsPage.tsx'
import EventDetailPage from './pages/EventDetailPage.tsx'

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
        </Route>
      </Routes>





    </div>
  )
}

export default App
