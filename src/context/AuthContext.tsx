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
      
      await executeMigration();
      
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
      
      const { error } = await supabase
        .from('admin_users')
        .insert(userData);
      
      if (error) {
        console.error('Error creating staff member:', error);
        
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
      
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('id, username, is_admin, position, salary, joining_date, shift_start, shift_end')
          .eq('is_admin', false);
        
        if (error) {
          throw error;
        }
        
        if (!data || !Array.isArray(data)) {
          return [];
        }
        
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
      
      const staffMembers: AdminUser[] = data.map(staff => ({
        id: staff.id || '',
        username: staff.username || '',
        isAdmin: staff.is_admin === true,
      }));
      
      await executeMigration();
      
      for (const member of staffMembers) {
        try {
          const { data: positionData, error: positionError } = await supabase
            .from('admin_users')
            .select('position')
            .eq('id', member.id)
            .maybeSingle();
            
          if (!positionError && positionData && positionData.position) {
            member.position = positionData.position;
          }
        } catch (e) {
          console.log('Position column may not exist yet:', e);
        }
        
        try {
          const { data: salaryData, error: salaryError } = await supabase
            .from('admin_users')
            .select('salary')
            .eq('id', member.id)
            .maybeSingle();
            
          if (!salaryError && salaryData && salaryData.salary) {
            member.salary = salaryData.salary;
          }
        } catch (e) {
          console.log('Salary column may not exist yet:', e);
        }
        
        try {
          const { data: dateData, error: dateError } = await supabase
            .from('admin_users')
            .select('joining_date')
            .eq('id', member.id)
            .maybeSingle();
            
          if (!dateError && dateData && dateData.joining_date) {
            member.joiningDate = dateData.joining_date;
          }
        } catch (e) {
          console.log('Joining date column may not exist yet:', e);
        }
        
        try {
          const { data: shiftData, error: shiftError } = await supabase
            .from('admin_users')
            .select('shift_start, shift_end')
            .eq('id', member.id)
            .maybeSingle();
            
          if (!shiftError && shiftData) {
            if (shiftData.shift_start) member.shiftStart = shiftData.shift_start;
            if (shiftData.shift_end) member.shiftEnd = shiftData.shift_end;
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

      await executeMigration();

      const dbData: Record<string, any> = {};
      
      if (updatedData.username) dbData.username = updatedData.username;
      if (updatedData.position !== undefined) dbData.position = updatedData.position;
      if (updatedData.salary !== undefined) dbData.salary = updatedData.salary;
      if (updatedData.joiningDate !== undefined) dbData.joining_date = updatedData.joiningDate;
      if (updatedData.shiftStart !== undefined) dbData.shift_start = updatedData.shiftStart;
      if (updatedData.shiftEnd !== undefined) dbData.shift_end = updatedData.shiftEnd;

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

  const executeMigration = async () => {
    try {
      const { data, error } = await supabase.rpc('execute_staff_fields_migration');
      
      if (error) {
        console.error('Error executing migration:', error);
        await createMigrationFunction();
      } else {
        console.log('Migration executed successfully:', data);
      }
    } catch (e) {
      console.error('Error during migration:', e);
      await createMigrationFunction();
    }
  };

  const createMigrationFunction = async () => {
    try {
      const addPosition = await supabase.rpc('add_column_if_not_exists', { 
        table_name: 'admin_users', 
        column_name: 'position',
        column_type: 'TEXT'
      });
      
      const addSalary = await supabase.rpc('add_column_if_not_exists', { 
        table_name: 'admin_users', 
        column_name: 'salary',
        column_type: 'NUMERIC'
      });
      
      const addJoiningDate = await supabase.rpc('add_column_if_not_exists', { 
        table_name: 'admin_users', 
        column_name: 'joining_date',
        column_type: 'TEXT'
      });
      
      const addShiftStart = await supabase.rpc('add_column_if_not_exists', { 
        table_name: 'admin_users', 
        column_name: 'shift_start',
        column_type: 'TEXT'
      });
      
      const addShiftEnd = await supabase.rpc('add_column_if_not_exists', { 
        table_name: 'admin_users', 
        column_name: 'shift_end',
        column_type: 'TEXT'
      });
      
      console.log('Direct column addition attempts:', {
        position: addPosition,
        salary: addSalary,
        joiningDate: addJoiningDate,
        shiftStart: addShiftStart,
        shiftEnd: addShiftEnd
      });
    } catch (e) {
      console.error('Error creating columns directly:', e);
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
