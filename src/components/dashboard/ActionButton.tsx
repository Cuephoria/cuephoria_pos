
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  path: string;
  iconColor: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  path,
  iconColor
}) => {
  const navigate = useNavigate();
  
  return (
    <Button 
      onClick={() => navigate(path)}
      variant="outline" 
      className="h-20 bg-[#1A1F2C] border-gray-700 hover:bg-[#2A2F3C] hover:border-purple-500"
    >
      <Icon className={`h-5 w-5 mr-2 ${iconColor}`} />
      <span>{label}</span>
    </Button>
  );
};

export default ActionButton;
