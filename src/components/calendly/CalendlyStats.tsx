
import React from 'react';
import { CalendarClock, Calendar, Clock, XCircle } from 'lucide-react';
import { CalendlyStats } from '@/services/calendlyService';
import StatCard from '@/components/StatCard';

interface CalendlyStatsProps {
  stats: CalendlyStats;
  loading: boolean;
}

const CalendlyStats: React.FC<CalendlyStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard
        title="Total Bookings"
        value={stats.total}
        icon={Calendar}
        description="All time bookings"
        color="text-cuephoria-purple"
      />
      <StatCard
        title="Upcoming"
        value={stats.upcoming}
        icon={CalendarClock}
        description="Future scheduled bookings"
        color="text-green-500"
      />
      <StatCard
        title="Past Bookings"
        value={stats.past}
        icon={Clock}
        description="Completed bookings"
        color="text-blue-500"
      />
      <StatCard
        title="Canceled"
        value={stats.canceled}
        icon={XCircle}
        description="Canceled bookings"
        color="text-red-500"
      />
    </div>
  );
};

export default CalendlyStats;
