import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainAppContent from './components/MainAppContent';

function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <ProtectedRoute>
          <MainAppContent />
        </ProtectedRoute>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;