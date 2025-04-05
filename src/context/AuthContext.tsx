
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
      
      // Create full staff data with all fields in a single insert operation
      const userData = {
        username,
        password,
        is_admin: false,
        position: position || null,
        salary: salary || null,
        joining_date: joiningDate || null,
        shift_start: shiftStart || null,
        shift_end: shiftEnd || null
      };
      
      // Try to insert all data at once
      const { error } = await supabase
        .from('admin_users')
        .insert(userData);
      
      if (error) {
        console.error('Error creating staff member:', error);
        
        // If the error is due to missing columns, fall back to inserting only basic fields
        if (error.message?.includes('column') && error.message?.includes('does not exist')) {
          console.warn('Falling back to basic user creation without extended fields');
          
          const basicUserData = {
            username,
            password,
            is_admin: false
          };
          
          const { error: basicError } = await supabase
            .from('admin_users')
            .insert(basicUserData);
            
          if (basicError) {
            console.error('Error creating basic staff member:', basicError);
            toast.error('Error creating staff member');
            return false;
          }
          
          toast.success('Staff member added successfully (without extended info)');
          return true;
        }
        
        toast.error('Error adding staff member');
        return false;
      }
      
      toast.success('Staff member added successfully');
      return true;
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
      
      // Try to get all fields in one query first
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, username, is_admin, position, salary, joining_date, shift_start, shift_end')
          .eq('is_admin', false);
        
        if (error) {
          // If this fails, we'll fall back to the more careful approach
          throw error;
        }
        
        if (!data || !Array.isArray(data)) {
          return [];
        }
        
        // Transform the data into our AdminUser type
        const staffMembers: AdminUser[] = data.map(staff => ({
          id: staff.id || '',
          username: staff.username || '',
          isAdmin: staff.is_admin === true,
          position: staff.position,
          salary: staff.salary,
          joiningDate: staff.joining_date,
          shiftStart: staff.shift_start,
          shiftEnd: staff.shift_end
        }));
        
        return staffMembers;
      } catch (e) {
        console.log('Error fetching all fields, falling back to safer approach:', e);
      }
      
      // First get basic fields which we know exist
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
      
      // Transform the basic data into our AdminUser type
      const staffMembers: AdminUser[] = data.map(staff => ({
        id: staff.id || '',
        username: staff.username || '',
        isAdmin: staff.is_admin === true,
      }));
      
      // Now try to supplement with extended fields for each staff member individually
      // This approach is safer as it will gracefully handle missing columns
      for (const member of staffMembers) {
        try {
          // Try to fetch position for this specific user - Properly handle errors
          const positionQuery = await supabase
            .from('admin_users')
            .select('position')
            .eq('id', member.id)
            .single();
          
          if (!positionQuery.error && positionQuery.data && 
              'position' in positionQuery.data && 
              typeof positionQuery.data.position === 'string') {
            member.position = positionQuery.data.position;
          }
        } catch (e) {
          console.log('Position column may not exist yet:', e);
        }
        
        try {
          // Try to fetch salary for this specific user - Properly handle errors
          const salaryQuery = await supabase
            .from('admin_users')
            .select('salary')
            .eq('id', member.id)
            .single();
          
          if (!salaryQuery.error && salaryQuery.data && 
              'salary' in salaryQuery.data && 
              typeof salaryQuery.data.salary === 'number') {
            member.salary = salaryQuery.data.salary;
          }
        } catch (e) {
          console.log('Salary column may not exist yet:', e);
        }
        
        try {
          // Try to fetch joining_date for this specific user - Properly handle errors
          const dateQuery = await supabase
            .from('admin_users')
            .select('joining_date')
            .eq('id', member.id)
            .single();
          
          if (!dateQuery.error && dateQuery.data && 
              'joining_date' in dateQuery.data && 
              typeof dateQuery.data.joining_date === 'string') {
            member.joiningDate = dateQuery.data.joining_date;
          }
        } catch (e) {
          console.log('Joining date column may not exist yet:', e);
        }
        
        try {
          // Try to fetch shift_start and shift_end for this specific user - Properly handle errors
          const shiftQuery = await supabase
            .from('admin_users')
            .select('shift_start, shift_end')
            .eq('id', member.id)
            .single();
          
          if (!shiftQuery.error && shiftQuery.data) {
            if ('shift_start' in shiftQuery.data && 
                typeof shiftQuery.data.shift_start === 'string') {
              member.shiftStart = shiftQuery.data.shift_start;
            }
            if ('shift_end' in shiftQuery.data && 
                typeof shiftQuery.data.shift_end === 'string') {
              member.shiftEnd = shiftQuery.data.shift_end;
            }
          }
        } catch (e) {
          console.log('Shift columns may not exist yet:', e);
        }
      }
      
      return staffMembers;
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
      if (updatedData.position !== undefined) dbData.position = updatedData.position;
      if (updatedData.salary !== undefined) dbData.salary = updatedData.salary;
      if (updatedData.joiningDate !== undefined) dbData.joining_date = updatedData.joiningDate;
      if (updatedData.shiftStart !== undefined) dbData.shift_start = updatedData.shiftStart;
      if (updatedData.shiftEnd !== undefined) dbData.shift_end = updatedData.shiftEnd;

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
