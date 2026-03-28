import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Ventes from './pages/Ventes'
import Stock from './pages/Stock'
import Depenses from './pages/Depenses'
import BilanService from './pages/BilanService'
import Rapport from './pages/Rapport'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/" element={<Home />} />
        <Route path="/ventes" element={<Ventes />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/depenses" element={<Depenses />} />
        <Route path="/bilan" element={<BilanService />} />
        <Route path="/rapport" element={<Rapport />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
