import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCommunityId, setActiveCommunityId] = useState(
    () => localStorage.getItem('communityId') || null
  );

  // Keep communityId in sync with the user object after login/me
  const setUser = (userData) => {
    setUserState(userData);
    if (userData?.communityId) {
      const cid =
        typeof userData.communityId === 'object'
          ? userData.communityId._id || userData.communityId
          : userData.communityId;
      const cidStr = cid?.toString() || null;
      setActiveCommunityId(cidStr);
      if (cidStr) {
        localStorage.setItem('communityId', cidStr);
      } else {
        localStorage.removeItem('communityId');
      }
    } else if (userData) {
      setActiveCommunityId(null);
      localStorage.removeItem('communityId');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  // Returns { email } — no JWT yet; caller must show OTP screen next
  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return { email: data.email };
  };

  // Called after user submits OTP — issues JWT and logs in
  const verifyOtp = async (email, otp) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  const resendOtp = async (email) => {
    await api.post('/auth/resend-otp', { email });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('communityId');
    setUserState(null);
    setActiveCommunityId(null);
  };

  // Called after entering a community to update the active community
  const enterCommunity = (communityId) => {
    const cidStr = communityId?.toString() || null;
    setActiveCommunityId(cidStr);
    if (cidStr) {
      localStorage.setItem('communityId', cidStr);
    } else {
      localStorage.removeItem('communityId');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout,
        isAdmin: user?.role === 'admin',
        activeCommunityId,
        enterCommunity,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
