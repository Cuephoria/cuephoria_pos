
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { Database } from '@/integrations/supabase/types';

interface StaffData {
  position?: string;
  salary?: number;
  joiningDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
}

interface AdminUser {
  id: string;
  username: string;
  isAdmin: boolean;
  position?: string;
  salary?: number;
  joiningDate?: string;
  shiftStart?: string;
  shiftEnd?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  login: (username: string, password: string, isAdminLogin: boolean) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  addStaffMember: (username: string, password: string, staffData?: StaffData) => Promise<boolean>;
  getStaffMembers: () => Promise<AdminUser[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkExistingUser = async () => {
      try {
        const storedAdmin = localStorage.getItem('cuephoriaAdmin');
        if (storedAdmin) {
          setUser(JSON.parse(storedAdmin));
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('admin_users')
          .select('id, username, is_admin')
          .single();
        
        if (error) {
          console.error('Error fetching admin user:', error);
          setIsLoading(false);
          return;
        }

        if (data) {
          const adminUser = {
            id: data.id,
            username: data.username,
            isAdmin: data.is_admin
          };
          setUser(adminUser);
          localStorage.setItem('cuephoriaAdmin', JSON.stringify(adminUser));
        }
      } catch (error) {
        console.error('Error checking existing user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingUser();
  }, []);

  const login = async (username: string, password: string, isAdminLogin: boolean): Promise<boolean> => {
    try {
      const query = supabase
        .from('admin_users')
        .select('id, username, is_admin, password');
      
      // If admin login is selected, only check admin accounts
      // If staff login is selected, only check staff accounts
      if (isAdminLogin) {
        query.eq('is_admin', true);
      } else {
        query.eq('is_admin', false);
      }
      
      query.eq('username', username);
      
      const { data, error } = await query.single();

      if (error || !data) {
        console.error('Login error:', error);
        return false;
      }

      if (data.password === password) {
        const adminUser = {
          id: data.id,
          username: data.username,
          isAdmin: data.is_admin
        };
        setUser(adminUser);
        localStorage.setItem('cuephoriaAdmin', JSON.stringify(adminUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cuephoriaAdmin');
  };

  // Function for admins to add staff members
  const addStaffMember = async (username: string, password: string, staffData?: StaffData): Promise<boolean> => {
    try {
      if (!user?.isAdmin) {
        console.error("Only admins can add staff members");
        return false;
      }

      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('username', username)
        .single();
      
      if (existingUser) {
        console.error('Username already exists');
        return false;
      }
      
      // Try to safely insert staff data
      try {
        const userData = {
          username,
          password,
          is_admin: false,
          ...(staffData ? {
            position: staffData.position,
            salary: staffData.salary,
            joining_date: staffData.joiningDate,
            shift_start: staffData.shiftStart,
            shift_end: staffData.shiftEnd
          } : {})
        };
        
        const { error } = await supabase
          .from('admin_users')
          .insert(userData);
        
        if (error) {
          // If we get an error about columns not existing, try again with just the basic fields
          if (error.message && error.message.includes("column") && error.message.includes("does not exist")) {
            console.warn('Staff data columns do not exist in the database, inserting basic user data only');
            const basicUserData = {
              username,
              password,
              is_admin: false
            };
            
            const { error: basicError } = await supabase
              .from('admin_users')
              .insert(basicUserData);
              
            if (basicError) {
              console.error('Error creating staff member with basic data:', basicError);
              return false;
            }
          } else {
            console.error('Error creating staff member:', error);
            return false;
          }
        }
        
        return true;
      } catch (insertError) {
        console.error('Error inserting staff data:', insertError);
        return false;
      }
    } catch (error) {
      console.error('Error adding staff member:', error);
      return false;
    }
  };

  // Function to get all staff members (for admin view)
  const getStaffMembers = async (): Promise<AdminUser[]> => {
    try {
      if (!user?.isAdmin) {
        console.error("Only admins can view staff members");
        return [];
      }
      
      // Try to get staff members with all fields
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, username, is_admin, position, salary, joining_date, shift_start, shift_end')
          .eq('is_admin', false);
        
        if (error) {
          // If there's an error about columns not existing, try with just the basic fields
          if (error.message && error.message.includes("column") && error.message.includes("does not exist")) {
            const { data: basicData, error: basicError } = await supabase
              .from('admin_users')
              .select('id, username, is_admin')
              .eq('is_admin', false);
              
            if (basicError) {
              console.error('Error fetching basic staff members:', basicError);
              return [];
            }
            
            return basicData.map(staff => ({
              id: staff.id,
              username: staff.username,
              isAdmin: staff.is_admin
            }));
          } else {
            console.error('Error fetching staff members:', error);
            return [];
          }
        }
        
        return data.map(staff => ({
          id: staff.id,
          username: staff.username,
          isAdmin: staff.is_admin,
          position: staff.position,
          salary: staff.salary,
          joiningDate: staff.joining_date,
          shiftStart: staff.shift_start,
          shiftEnd: staff.shift_end
        }));
      } catch (selectError) {
        console.error('Error in select query:', selectError);
        
        // Fallback to basic staff data
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, username, is_admin')
          .eq('is_admin', false);
        
        if (error) {
          console.error('Error fetching basic staff members:', error);
          return [];
        }
        
        return data.map(staff => ({
          id: staff.id,
          username: staff.username,
          isAdmin: staff.is_admin
        }));
      }
    } catch (error) {
      console.error('Error fetching staff members:', error);
      return [];
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, addStaffMember, getStaffMembers }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
