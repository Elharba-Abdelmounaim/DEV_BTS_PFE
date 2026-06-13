import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, me } from '../api/auth';
import type { User, LoginPayload, RegisterPayload } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  setUser: (user: User | null) => void;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  isTeacher: boolean;
  isStudent: boolean;
}

type AuthAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_LOADING'; payload: boolean };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  loading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      me()
        .then((user) => dispatch({ type: 'SET_USER', payload: user }))
        .catch(() => {
          localStorage.removeItem('token');
          dispatch({ type: 'SET_USER', payload: null });
        });
    } else {
      dispatch({ type: 'SET_USER', payload: null });
    }
  }, []);

  const setUser = (user: User | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  };

  const login = async (payload: LoginPayload) => {
    const { user, token } = await apiLogin(payload.email, payload.password);
    localStorage.setItem('token', token);
    dispatch({ type: 'SET_USER', payload: user });
  };

  const register = async (payload: RegisterPayload) => {
    const { user, token } = await apiRegister(payload);
    localStorage.setItem('token', token);
    dispatch({ type: 'SET_USER', payload: user });
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('token');
      dispatch({ type: 'SET_USER', payload: null });
    }
  };

  const value: AuthContextType = {
    ...state,
    setUser,
    login,
    register,
    logout,
    isTeacher: state.user?.role === 'teacher',
    isStudent: state.user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}