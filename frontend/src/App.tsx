import './App.css'
import { ToastContainer } from 'react-toastify'
import { Outlet } from 'react-router'
function App() {
  return (
    <div>
      <ToastContainer
        position='top-right'
        autoClose={2000}
        theme='light'
      />

      <Outlet />
    </div>
  )
}

export default App
