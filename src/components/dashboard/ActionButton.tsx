
import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScreenSize } from '@/hooks/use-mobile';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  path: string;
  iconColor: string;
  size?: 'compact' | 'normal';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  path,
  iconColor,
  size = 'normal'
}) => {
  const navigate = useNavigate();
  const { isMobile } = useScreenSize();
  
  const isCompact = size === 'compact' || isMobile;
  
  return (
    <Button 
      onClick={() => navigate(path)}
      variant="outline" 
      className={`${isCompact ? 'h-14 py-1' : 'h-16 sm:h-20'} w-full bg-[#1A1F2C] border-gray-700 hover:bg-[#2A2F3C] hover:border-purple-500 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 p-2 sm:p-4`}
    >
      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} />
      <span className="text-xs text-center sm:text-left line-clamp-1">{label}</span>
    </Button>
  );
};

export default ActionButton;
