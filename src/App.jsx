import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MessagesProvider } from './context/MessagesContext';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
          <MessagesProvider>
          <AppRoutes />
        </MessagesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;