import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Account } from './pages/Account';
import { AccessFile } from './pages/AccessFile';

import { GOOGLE_CLIENT_ID } from './constants/config';

export const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/account" element={<Account />} />
          <Route path="/share" element={<AccessFile />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
