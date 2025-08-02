// src/components/ProtectedRoute.js
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
    
    if (!loading && adminOnly && !isAdmin) {
      navigate('/');
    }
  }, [loading, isAuthenticated, isAdmin, navigate]);

  if (loading || !isAuthenticated || (adminOnly && !isAdmin)) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return children;
};

export default ProtectedRoute;