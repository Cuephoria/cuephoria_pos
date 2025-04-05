import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { Database } from '@/integrations/supabase/types';

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
  addStaffMember: (username: string, password: string, position?: string, salary?: number, joiningDate?: string, shiftStart?: string, shiftEnd?: string) => Promise<boolean>;
  getStaffMembers: () => Promise<AdminUser[]>;
  updateStaffMember: (id: string, data: Partial<AdminUser>) => Promise<boolean>;
  deleteStaffMember: (id: string) => Promise<boolean>;
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

  const addStaffMember = async (
    username: string, 
    password: string, 
    position?: string, 
    salary?: number, 
    joiningDate?: string, 
    shiftStart?: string, 
    shiftEnd?: string
  ): Promise<boolean> => {
    try {
      if (!user?.isAdmin) {
        console.error("Only admins can add staff members");
        return false;
      }

      const { data: existingUser, error: checkError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('username', username)
        .single();
      
      if (existingUser) {
        console.error('Username already exists');
        return false;
      }
      
      try {
        const { error } = await supabase
          .from('admin_users')
          .insert({
            username,
            password,
            is_admin: false,
            position,
            salary,
            joining_date: joiningDate,
            shift_start: shiftStart,
            shift_end: shiftEnd
          });
        
        if (error) {
          console.error('Error creating staff member:', error);
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Error adding staff member:', error);
        return false;
      }
    } catch (error) {
      console.error('Error adding staff member:', error);
      return false;
    }
  };

  const getStaffMembers = async (): Promise<AdminUser[]> => {
    try {
      if (!user?.isAdmin) {
        console.error("Only admins can view staff members");
        return [];
      }
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, username, is_admin, position, salary, joining_date, shift_start, shift_end')
        .eq('is_admin', false);
      
      if (error) {
        console.error('Error fetching staff members with extended fields:', error);
        
        const { data: basicData, error: basicError } = await supabase
          .from('admin_users')
          .select('id, username, is_admin')
          .eq('is_admin', false);
        
        if (basicError || !basicData) {
          console.error('Error fetching staff members:', basicError);
          return [];
        }
        
        return basicData.map(staff => ({
          id: staff.id,
          username: staff.username,
          isAdmin: staff.is_admin
        }));
      }
      
      if (!data || !Array.isArray(data)) {
        return [];
      }
      
      return data.map(staff => ({
        id: staff.id || '',
        username: staff.username || '',
        isAdmin: !!staff.is_admin,
        position: staff.position || undefined,
        salary: typeof staff.salary === 'number' ? staff.salary : undefined,
        joiningDate: staff.joining_date || undefined,
        shiftStart: staff.shift_start || undefined,
        shiftEnd: staff.shift_end || undefined
      }));
    } catch (error) {
      console.error('Error fetching staff members:', error);
      return [];
    }
  };

  const updateStaffMember = async (id: string, updatedData: Partial<AdminUser>): Promise<boolean> => {
    try {
      if (!user?.isAdmin) {
        console.error("Only admins can update staff members");
        return false;
      }

      const dbData: any = {
        username: updatedData.username,
        position: updatedData.position,
        salary: updatedData.salary,
        joining_date: updatedData.joiningDate,
        shift_start: updatedData.shiftStart,
        shift_end: updatedData.shiftEnd
      };
      
      Object.keys(dbData).forEach(key => {
        if (dbData[key] === undefined) {
          delete dbData[key];
        }
      });

      const { error } = await supabase
        .from('admin_users')
        .update(dbData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating staff member:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating staff member:', error);
      return false;
    }
  };

  const deleteStaffMember = async (id: string): Promise<boolean> => {
    try {
      if (!user?.isAdmin) {
        console.error("Only admins can delete staff members");
        return false;
      }
      
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting staff member:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting staff member:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      addStaffMember, 
      getStaffMembers,
      updateStaffMember,
      deleteStaffMember 
    }}>
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
