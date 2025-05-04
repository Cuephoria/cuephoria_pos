
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
  description?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  path,
  iconColor,
  description
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <Button 
      onClick={() => navigate(path)}
      variant="outline" 
      className="h-16 sm:h-20 w-full bg-[#1A1F2C] border-gray-700 hover:bg-[#2A2F3C] hover:border-purple-500 flex flex-col sm:flex-row items-center justify-center text-center sm:justify-start gap-1 sm:gap-2 p-2 sm:p-4 transition-all duration-200 overflow-hidden"
    >
      <Icon className={`h-5 w-5 ${iconColor} shrink-0`} />
      <div className="flex flex-col items-center sm:items-start overflow-hidden">
        <span className="text-xs sm:text-sm text-center sm:text-left font-medium truncate w-full">{label}</span>
        {description && !isMobile && (
          <span className="text-xs text-gray-400 hidden sm:block truncate w-full">{description}</span>
        )}
      </div>
    </Button>
  );
};

export default ActionButton;
