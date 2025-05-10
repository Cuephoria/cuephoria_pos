
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Monitor, Clock, Timer } from 'lucide-react';
import { Station, Session } from '@/types/pos.types';

const PublicStations = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch stations
        const { data: stationsData, error: stationsError } = await supabase
          .from('stations')
          .select('*');
          
        if (stationsError) throw stationsError;
        
        // Fetch active sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select('*')
          .is('end_time', null);
          
        if (sessionsError) throw sessionsError;
        
        // Transform data to match our types
        const transformedStations: Station[] = stationsData.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type as 'ps5' | '8ball',
          hourlyRate: item.hourly_rate,
          isOccupied: item.is_occupied,
          currentSession: null
        }));
        
        const transformedSessions: Session[] = sessionsData.map(item => ({
          id: item.id,
          stationId: item.station_id,
          customerId: item.customer_id,
          startTime: new Date(item.start_time),
          endTime: item.end_time ? new Date(item.end_time) : undefined,
          duration: item.duration
        }));
        
        // Connect sessions to stations
        const stationsWithSessions = transformedStations.map(station => {
          const activeSession = transformedSessions.find(s => s.stationId === station.id);
          return {
            ...station,
            isOccupied: !!activeSession,
            currentSession: activeSession || null
          };
        });
        
        setStations(stationsWithSessions);
        setSessions(transformedSessions);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate session duration in minutes
  const getSessionDuration = (startTime: Date) => {
    const start = new Date(startTime);
    const now = new Date();
    const durationMs = now.getTime() - start.getTime();
    return Math.floor(durationMs / (1000 * 60));
  };
  
  // Format duration as hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Separate stations by type
  const ps5Stations = stations.filter(station => station.type === 'ps5');
  const ballStations = stations.filter(station => station.type === '8ball');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent animate-spin"></div>
          <p className="mt-4 text-cuephoria-lightpurple">Loading stations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black">
      {/* Header */}
      <header className="py-8 px-4 sm:px-6 md:px-8 animate-fade-in">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white font-heading bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple via-cuephoria-lightpurple to-cuephoria-blue">
              Cuephoria Live Status
            </h1>
            <p className="mt-2 text-xl text-gray-300">
              Check the availability of our gaming stations in real-time
            </p>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="py-6 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
        {/* PlayStation Section */}
        <section className="mb-12 animate-slide-up">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-cuephoria-purple/20 flex items-center justify-center mr-3">
              <Monitor className="h-5 w-5 text-cuephoria-lightpurple" />
            </div>
            <h2 className="text-2xl font-bold text-white">PlayStation 5 Consoles</h2>
          </div>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {ps5Stations.map((station, index) => (
              <div 
                key={station.id} 
                className="animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PublicStationCard station={station} />
              </div>
            ))}
          </div>
        </section>
        
        {/* Pool Tables Section */}
        <section className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center mr-3">
              <Timer className="h-5 w-5 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">8-Ball Pool Tables</h2>
          </div>
          
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {ballStations.map((station, index) => (
              <div 
                key={station.id} 
                className="animate-scale-in"
                style={{ animationDelay: `${(index + ps5Stations.length) * 100}ms` }}
              >
                <PublicStationCard station={station} />
              </div>
            ))}
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="py-6 px-4 sm:px-6 md:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Cuephoria. All rights reserved.
          </p>
          <div className="flex items-center mt-4 md:mt-0">
            <Clock className="h-4 w-4 text-gray-400 mr-1" />
            <p className="text-gray-400 text-sm">
              Updated every 30 seconds
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Station Card Component
const PublicStationCard = ({ station }: { station: Station }) => {
  const isPoolTable = station.type === '8ball';
  const sessionStartTime = station.currentSession?.startTime;
  
  const calculateDuration = () => {
    if (!sessionStartTime) return null;
    
    const start = new Date(sessionStartTime);
    const now = new Date();
    const durationMs = now.getTime() - start.getTime();
    
    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return {
      hours,
      minutes,
      seconds,
      formatted: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    };
  };

  const [duration, setDuration] = useState(calculateDuration());

  useEffect(() => {
    if (!station.isOccupied) return;
    
    const timer = setInterval(() => {
      setDuration(calculateDuration());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [station.isOccupied, sessionStartTime]);
  
  return (
    <div className={`
      relative overflow-hidden rounded-xl border 
      ${isPoolTable 
        ? 'bg-gradient-to-br from-green-900/40 to-black border-green-800/50'
        : 'bg-gradient-to-br from-cuephoria-purple/30 to-black border-cuephoria-purple/40'
      }
      transition-all duration-300 hover:shadow-lg hover:shadow-${isPoolTable ? 'green-900/30' : 'cuephoria-purple/20'}
      ${station.isOccupied ? 'animate-pulse-soft' : ''}
    `}>
      <div className="p-5">
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`
            px-2 py-1 text-xs font-medium rounded-full
            ${station.isOccupied
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : 'bg-green-500/20 text-green-300 border border-green-500/30'}
          `}>
            {station.isOccupied ? 'Occupied' : 'Available'}
          </span>
        </div>
        
        {/* Station Icon and Name */}
        <div className="flex items-center mb-4 mt-2">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center mr-3
            ${isPoolTable ? 'bg-green-900/50' : 'bg-cuephoria-purple/40'}
          `}>
            {isPoolTable ? (
              <Timer className="h-6 w-6 text-green-400" />
            ) : (
              <Monitor className="h-6 w-6 text-cuephoria-lightpurple" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-white">{station.name}</h3>
        </div>
        
        {/* Duration if occupied */}
        {station.isOccupied && duration && (
          <div className="mt-4">
            <div className="flex items-center mb-2">
              <Clock className={`h-4 w-4 ${isPoolTable ? 'text-green-400' : 'text-cuephoria-lightpurple'} mr-2`} />
              <span className="text-gray-300 text-sm">Time in use</span>
            </div>
            <div className={`
              font-mono text-xl bg-black/50 px-3 py-2 rounded-md text-center
              ${isPoolTable ? 'text-green-400' : 'text-cuephoria-lightpurple'}
            `}>
              {duration.formatted}
            </div>
          </div>
        )}
        
        {/* Available message if not occupied */}
        {!station.isOccupied && (
          <div className="mt-4 py-3 text-center">
            <p className={`text-sm ${isPoolTable ? 'text-green-400' : 'text-cuephoria-lightpurple'}`}>
              Ready for next player!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicStations;
