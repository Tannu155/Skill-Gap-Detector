import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
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

function CacheClearer() {
  useEffect(() => {
    const version = localStorage.getItem('app_version');
    if (version !== '2.0') {
      const user = localStorage.getItem('user');
      localStorage.clear();
      if (user) localStorage.setItem('user', user);
      localStorage.setItem('app_version', '2.0');
    }
  }, []);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <CacheClearer />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/select-role" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/loading-skills" element={<PrivateRoute><LoadingSkills /></PrivateRoute>} />
        <Route path="/universal-test" element={<PrivateRoute><UniversalTest /></PrivateRoute>} />
        <Route path="/report" element={<PrivateRoute><Report /></PrivateRoute>} />
        <Route path="/hr" element={<PrivateRoute hrOnly={true}><HR /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
