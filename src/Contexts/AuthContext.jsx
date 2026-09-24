import { createContext, useState } from 'react';
import { Outlet } from 'react-router-dom';
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [institutionIds, setInstitutionIds] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = sessionStorage.getItem('user');
    if (cached) {
      const user = JSON.parse(cached);
      setUser(user?.email);
      setRole(user?.role);
      setInstitutionIds(user?.institutionIds);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        institutionIds,
        setUser,
        setRole,
        setInstitutionIds,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
