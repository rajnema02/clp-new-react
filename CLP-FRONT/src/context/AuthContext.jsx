import { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../Services/api.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    loading: true,
    error: null
  });

  const safeParse = (data) => {
    try {
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('JSON parsing error:', error);
      return null;
    }
  };

  useEffect(() => {
  const initializeAuth = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setAuthState({ user: null, loading: false, error: null });
        return;
      }

      try {
        // ✅ Send token to backend
        const response = await apiService.get('auth/verify-token', {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (response.data?.valid) {
          // ✅ Prefer backend user data
          const userFromBackend = response.data.user;
          if (userFromBackend) {
            setAuthState({ user: userFromBackend, loading: false, error: null });

            // Keep localStorage in sync
            if (userFromBackend.role === 'admin') {
              localStorage.setItem('admin', JSON.stringify(userFromBackend));
              localStorage.removeItem('user');
            } else {
              localStorage.setItem('user', JSON.stringify(userFromBackend));
              localStorage.removeItem('admin');
            }
            return;
          }

          // Fallback to localStorage
          const storedUser =
            safeParse(localStorage.getItem('admin')) ||
            safeParse(localStorage.getItem('user'));

          if (storedUser) {
            setAuthState({ user: storedUser, loading: false, error: null });
            return;
          }
        }
      } catch (error) {
        console.log('Token verification failed:', error?.response?.data || error.message);
      }

      // If fails, clear auth
      ['user', 'admin', 'accessToken', 'refreshToken'].forEach(key =>
        localStorage.removeItem(key)
      );
      setAuthState({ user: null, loading: false, error: null });

    } catch (error) {
      console.error('Auth initialization error:', error);
      ['user', 'admin'].forEach(key => localStorage.removeItem(key));
      setAuthState({
        user: null,
        loading: false,
        error: 'Failed to load user data'
      });
    }
  };

  initializeAuth();
}, []);


  const login = async (credentials, isAdmin = false) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const endpoint = isAdmin ? 'auth/authlogin' : 'user/userlogin';
      const response = await apiService.post(endpoint, credentials);

      if (!response?.data) {
        throw new Error('Invalid response from server');
      }

      const { token, refreshToken, ...userData } = response.data;

      if (!token) {
        throw new Error('Authentication token missing');
      }

      if (!userData.id) {
        throw new Error('User ID missing in response');
      }

      // Combine all user data with token
      const userWithToken = {
        ...userData,
        token
      };

      // Store data based on role
      const storageKey = isAdmin ? 'admin' : 'user';
      localStorage.setItem(storageKey, JSON.stringify(userWithToken));
      if (isAdmin) {
        localStorage.removeItem('user');
      } else {
        localStorage.removeItem('admin');
      }

      localStorage.setItem('accessToken', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      setAuthState({
        user: userWithToken,
        loading: false,
        error: null
      });

      return userWithToken;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';
      console.error('Login error:', error);
      setAuthState({
        user: null,
        loading: false,
        error: errorMsg
      });
      throw error;
    }
  };

  const logout = () => {
    ['accessToken', 'refreshToken', 'user', 'admin'].forEach(key => {
      localStorage.removeItem(key);
    });
    setAuthState({
      user: null,
      loading: false,
      error: null
    });
  };

  const value = {
    ...authState,
    login,
    logout,
    isAuthenticated: !!authState.user,
    isAdmin: authState.user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};