
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

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
        toast.error("Only admins can add staff members");
        return false;
      }

      const { data: existingUser, error: checkError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('username', username)
        .single();
      
      if (existingUser) {
        console.error('Username already exists');
        toast.error('Username already exists');
        return false;
      }
      
      // Create minimal staff data
      const basicUserData = {
        username,
        password,
        is_admin: false
      };
      
      // Add extended fields if they exist in the database - attempt this in a separate step
      try {
        const { error } = await supabase
          .from('admin_users')
          .insert(basicUserData);
        
        if (error) {
          console.error('Error creating staff member:', error);
          toast.error('Error creating staff member');
          return false;
        }
        
        // Try to update with extended information if provided
        if (position || salary || joiningDate || shiftStart || shiftEnd) {
          const extendedData: Record<string, any> = {};
          
          if (position) extendedData.position = position;
          if (salary) extendedData.salary = salary;
          if (joiningDate) extendedData.joining_date = joiningDate;
          if (shiftStart) extendedData.shift_start = shiftStart;
          if (shiftEnd) extendedData.shift_end = shiftEnd;
          
          const { error: updateError } = await supabase
            .from('admin_users')
            .update(extendedData)
            .eq('username', username);
          
          // If there's an error updating the extended fields, log it but don't fail
          // This way users can still be created even if the extended fields aren't available
          if (updateError) {
            console.warn('Could not update extended staff fields:', updateError);
          }
        }
        
        toast.success('Staff member added successfully');
        return true;
      } catch (error) {
        console.error('Error adding staff member:', error);
        toast.error('Error adding staff member');
        return false;
      }
    } catch (error) {
      console.error('Error adding staff member:', error);
      toast.error('Error adding staff member');
      return false;
    }
  };

  const getStaffMembers = async (): Promise<AdminUser[]> => {
    try {
      if (!user?.isAdmin) {
        console.error("Only admins can view staff members");
        toast.error("Only admins can view staff members");
        return [];
      }
      
      // First try to get all fields including the extended ones
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, username, is_admin, position, salary, joining_date, shift_start, shift_end')
          .eq('is_admin', false);
          
        if (error) {
          throw error; // This will be caught by the outer catch and try the fallback
        }
        
        if (!data || !Array.isArray(data)) {
          return [];
        }
        
        // All fields worked, return full data
        return data.map(staff => ({
          id: staff.id || '',
          username: staff.username || '',
          isAdmin: staff.is_admin === true,
          position: staff.position,
          salary: staff.salary,
          joiningDate: staff.joining_date,
          shiftStart: staff.shift_start,
          shiftEnd: staff.shift_end
        }));
      } catch (detailedError) {
        console.warn("Could not fetch extended staff fields. Falling back to basic fields.");
        
        // Fallback to just the basic fields
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, username, is_admin')
          .eq('is_admin', false);
        
        if (error) {
          console.error('Error fetching staff members:', error);
          toast.error('Error fetching staff members');
          return [];
        }
        
        if (!data || !Array.isArray(data)) {
          return [];
        }
        
        // Return basic data
        return data.map(staff => ({
          id: staff.id || '',
          username: staff.username || '',
          isAdmin: staff.is_admin === true
        }));
      }
    } catch (error) {
      console.error('Error fetching staff members:', error);
      toast.error('Error fetching staff members');
      return [];
    }
  };

  const updateStaffMember = async (id: string, updatedData: Partial<AdminUser>): Promise<boolean> => {
    try {
      if (!user?.isAdmin) {
        console.error("Only admins can update staff members");
        toast.error("Only admins can update staff members");
        return false;
      }

      // Construct database fields carefully
      const dbData: Record<string, any> = {};
      
      if (updatedData.username) dbData.username = updatedData.username;
      
      // Only try to update extended fields if they exist
      try {
        // First check if the columns exist by doing a small query
        if (updatedData.position || updatedData.salary || updatedData.joiningDate || 
            updatedData.shiftStart || updatedData.shiftEnd) {
          
          if (updatedData.position) dbData.position = updatedData.position;
          if (updatedData.salary !== undefined) dbData.salary = updatedData.salary;
          if (updatedData.joiningDate) dbData.joining_date = updatedData.joiningDate;
          if (updatedData.shiftStart) dbData.shift_start = updatedData.shiftStart;
          if (updatedData.shiftEnd) dbData.shift_end = updatedData.shiftEnd;
        }
      } catch (error) {
        console.warn("Extended fields not available, updating only basic fields");
      }

      // Only update if there's something to update
      if (Object.keys(dbData).length > 0) {
        const { error } = await supabase
          .from('admin_users')
          .update(dbData)
          .eq('id', id);
        
        if (error) {
          console.error('Error updating staff member:', error);
          toast.error('Error updating staff member');
          return false;
        }
      } else {
        console.warn("No valid fields to update");
      }
      
      toast.success('Staff member updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating staff member:', error);
      toast.error('Error updating staff member');
      return false;
    }
  };

  const deleteStaffMember = async (id: string): Promise<boolean> => {
    try {
      if (!user?.isAdmin) {
        console.error("Only admins can delete staff members");
        toast.error("Only admins can delete staff members");
        return false;
      }
      
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting staff member:', error);
        toast.error('Error deleting staff member');
        return false;
      }
      
      toast.success('Staff member deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting staff member:', error);
      toast.error('Error deleting staff member');
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
