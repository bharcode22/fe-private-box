import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Login } from './pages/Login';
import { Terms } from './pages/Terms';
import { Dashboard } from './pages/Dashboard';
import { AccessFile } from './pages/AccessFile';

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '1084639382013-kl0fqv71kk5975dtd6t43cqmmuj4t0bj.apps.googleusercontent.com';

export const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/share" element={<AccessFile />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
