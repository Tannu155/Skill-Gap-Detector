import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import Home from './pages/Home/Home';
import LoadingSkills from './pages/LoadingSkills/LoadingSkills';
import UniversalTest from './pages/UniversalTest/UniversalTest';
import Report from './pages/Report/Report';
import HR from './pages/HR/HR';

function PrivateRoute({ children, hrOnly = false }) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!user.id) return <Navigate to="/login" />;
  if (hrOnly && !user.is_hr) return <Navigate to="/" />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/loading-skills" element={<PrivateRoute><LoadingSkills /></PrivateRoute>} />
        <Route path="/universal-test" element={<PrivateRoute><UniversalTest /></PrivateRoute>} />
        <Route path="/report" element={<PrivateRoute><Report /></PrivateRoute>} />
        <Route path="/hr" element={<PrivateRoute hrOnly={true}><HR /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
