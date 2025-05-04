
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  
  return (
    <Button 
      onClick={() => navigate(path)}
      variant="outline" 
      className="h-16 sm:h-20 w-full bg-[#1A1F2C] border-gray-700 hover:bg-[#2A2F3C] hover:border-purple-500 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 p-2 sm:p-4"
    >
      <Icon className={`h-5 w-5 ${iconColor}`} />
      <span className="text-xs sm:text-sm text-center sm:text-left">{label}</span>
    </Button>
  );
};

export default ActionButton;
