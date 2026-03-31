import { BrowserRouter } from 'react-router-dom'
import './App.css'
import { AppStateProvider } from './context/AppStateContext'
import { AppRoutes } from './routes/AppRoutes'

function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppStateProvider>
  )
}

export default App
