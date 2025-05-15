import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import AppLayout from './components/layout/AppLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ContactsListPage from './pages/ContactsListPage';
import NewContactPage from './pages/NewContactPage';
import EditContactPage from './pages/EditContactPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Protected routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<ContactsListPage />} />
            <Route path="/contacts/new" element={<NewContactPage />} />
            <Route path="/contacts/edit/:id" element={<EditContactPage />} />
          </Route>

          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/sign-in" element={<SignInPage />} />
            <Route path="/sign-up" element={<SignUpPage />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;