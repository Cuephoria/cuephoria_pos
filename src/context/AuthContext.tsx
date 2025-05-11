
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  role: string;
  isAdmin: boolean; // Add isAdmin property
  username: string; // Add username property
}

interface AdminUser {
  id: string;
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string, isAdminLogin?: boolean) => Promise<boolean>; // Update login signature
  logout: () => void;
  loading: boolean;
  // Add missing methods for staff management
  addStaffMember: (username: string, password: string) => Promise<boolean>;
  getStaffMembers: () => Promise<AdminUser[]>;
  updateStaffMember: (id: string, data: Partial<AdminUser>) => Promise<boolean>;
  deleteStaffMember: (id: string) => Promise<boolean>;
  resetPassword: (username: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  loading: true,
  addStaffMember: async () => false,
  getStaffMembers: async () => [],
  updateStaffMember: async () => false,
  deleteStaffMember: async () => false,
  resetPassword: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const storedUser = localStorage.getItem('cuephoriaUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('cuephoriaUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string, isAdminLogin: boolean = true): Promise<boolean> => {
    // For demo purposes, use mock authentication
    // In a real app, this would be replaced with a call to an authentication API
    if (isAdminLogin) {
      // Admin login
      if (username === 'admin' && password === 'admin123') {
        const user = {
          id: '1',
          name: 'Admin User',
          role: 'admin',
          isAdmin: true,
          username: 'admin'
        };
        setUser(user);
        localStorage.setItem('cuephoriaUser', JSON.stringify(user));
        return true;
      }
    } else {
      // Staff login
      if (username === 'staff' && password === 'staff123') {
        const user = {
          id: '2',
          name: 'Staff User',
          role: 'staff',
          isAdmin: false,
          username: 'staff'
        };
        setUser(user);
        localStorage.setItem('cuephoriaUser', JSON.stringify(user));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cuephoriaUser');
  };

  // Staff management functions
  const addStaffMember = async (username: string, password: string): Promise<boolean> => {
    // Mock implementation - in real app, call API
    console.log(`Creating staff member: ${username}`);
    return true;
  };

  const getStaffMembers = async (): Promise<AdminUser[]> => {
    // Mock implementation - in real app, fetch from API
    return [
      { id: '2', username: 'staff', isAdmin: false },
      { id: '3', username: 'manager', isAdmin: false }
    ];
  };

  const updateStaffMember = async (id: string, data: Partial<AdminUser>): Promise<boolean> => {
    // Mock implementation - in real app, call API
    console.log(`Updating staff member ${id} with data:`, data);
    return true;
  };

  const deleteStaffMember = async (id: string): Promise<boolean> => {
    // Mock implementation - in real app, call API
    console.log(`Deleting staff member ${id}`);
    return true;
  };

  const resetPassword = async (username: string, newPassword: string): Promise<boolean> => {
    // Mock implementation - in real app, call API
    console.log(`Resetting password for ${username}`);
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      loading,
      addStaffMember,
      getStaffMembers,
      updateStaffMember,
      deleteStaffMember,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
