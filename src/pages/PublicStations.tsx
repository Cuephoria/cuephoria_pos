import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Monitor, Clock, Timer, Wifi, Gamepad2, RefreshCcw, Calendar } from 'lucide-react';
import { Station, Session } from '@/types/pos.types';
import Logo from '@/components/Logo';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import BookingDialog from '@/components/booking/BookingDialog';

const PublicStations = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [timeToNextRefresh, setTimeToNextRefresh] = useState(30);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  // New state for booking dialog
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setRefreshing(true);
      
      try {
        console.log('Fetching station data...');
        
        // Fetch stations
        const { data: stationsData, error: stationsError } = await supabase
          .from('stations')
          .select('*');
          
        if (stationsError) {
          console.error('Error fetching stations:', stationsError);
          setLoadingError('Failed to load station data');
          throw stationsError;
        }
        
        // Fetch active sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select('*')
          .is('end_time', null);
          
        if (sessionsError) {
          console.error('Error fetching sessions:', sessionsError);
          setLoadingError('Failed to load session data');
          throw sessionsError;
        }
        
        console.log('Fetched data:', { stations: stationsData?.length, sessions: sessionsData?.length });
        
        // Transform data to match our types
        const transformedStations: Station[] = stationsData?.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type as 'ps5' | '8ball',
          hourlyRate: item.hourly_rate,
          isOccupied: item.is_occupied,
          currentSession: null,
          // New fields
          consolidatedName: item.consolidated_name || undefined,
          isController: item.is_controller || false,
          parentStationId: item.parent_station_id || undefined
        })) || [];
        
        const transformedSessions: Session[] = sessionsData?.map(item => ({
          id: item.id,
          stationId: item.station_id,
          customerId: item.customer_id,
          startTime: new Date(item.start_time),
          endTime: item.end_time ? new Date(item.end_time) : undefined,
          duration: item.duration
        })) || [];
        
        // Group controllers by console
        const groupedStations = transformedStations.reduce((acc, station) => {
          // Filter out controllers
          if (station.isController && station.parentStationId) {
            return acc;
          }
          
          // For main stations/consoles, check if controllers are attached
          if (station.type === 'ps5' && !station.isController) {
            // Find all controllers for this console
            const controllers = transformedStations.filter(
              s => s.isController && s.parentStationId === station.id
            );
            
            // Combined console is occupied if any controller is occupied
            const isAnyControllerOccupied = controllers.some(c => c.isOccupied);
            
            // Return the main console with updated occupied status
            return [...acc, {
              ...station,
              isOccupied: station.isOccupied || isAnyControllerOccupied,
              consolidatedName: station.consolidatedName || station.name
            }];
          }
          
          // For other types, just pass through
          return [...acc, station];
        }, [] as Station[]);
        
        // Connect sessions to stations
        const stationsWithSessions = groupedStations.map(station => {
          const activeSession = transformedSessions.find(s => s.stationId === station.id);
          return {
            ...station,
            isOccupied: !!activeSession || station.isOccupied,
            currentSession: activeSession || null
          };
        });
        
        // Update state with new data in a smooth transition
        setTimeout(() => {
          setStations(stationsWithSessions);
          setSessions(transformedSessions);
          setRefreshing(false);
          setLastRefresh(new Date());
          setTimeToNextRefresh(30);
          setLoadingError(null);
          setLoading(false);
        }, 300); // Small delay for smooth transition
      } catch (error) {
        console.error('Error fetching data:', error);
        setRefreshing(false);
        setLoading(false);
        // Keep the old data if available during error
      }
    };

    fetchData();
    
    // Set up interval to refresh data every 30 seconds
    const refreshInterval = setInterval(fetchData, 30000);
    
    // Set up countdown timer
    const countdownInterval = setInterval(() => {
      setTimeToNextRefresh(prev => {
        if (prev <= 1) return 30;
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  // Handle booking
  const handleBookStation = (station: Station) => {
    setSelectedStation(station);
    setBookingDialogOpen(true);
  };

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
    return <ImprovedLoadingView error={loadingError} />;
  }

  if (stations.length === 0 && !loading) {
    return <NoStationsView error={loadingError} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black overflow-hidden">
      {/* Header with logo */}
      <header className="py-8 px-4 sm:px-6 md:px-8 animate-fade-in relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-6 animate-float">
              <img 
                src="/lovable-uploads/61f60a38-12c2-4710-b1c8-0000eb74593c.png" 
                alt="Cuephoria Logo" 
                className="h-24 shadow-lg shadow-cuephoria-purple/30"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white font-heading bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple via-cuephoria-lightpurple to-cuephoria-blue animate-text-gradient">
              Station Live Status
            </h1>
            <p className="mt-2 text-xl text-gray-300 max-w-2xl text-center">
              Check the availability of our gaming stations in real-time
            </p>
            
            {/* Animated data freshness indicator */}
            <div className="mt-4 bg-black/20 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center space-x-2 border border-gray-800/50 shadow-inner">
              <div className={`w-2 h-2 rounded-full ${refreshing ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`}></div>
              <div className="text-sm text-gray-300 flex items-center space-x-2">
                {refreshing ? (
                  <span className="flex items-center">
                    <RefreshCcw className="h-3 w-3 mr-1.5 animate-spin-slow" />
                    <span>Refreshing data...</span>
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1.5" />
                    <span>Auto-refresh in {timeToNextRefresh}s</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Stats summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 max-w-4xl mx-auto mb-10">
            <div className="bg-gradient-to-br from-cuephoria-purple/30 to-cuephoria-purple/5 backdrop-blur-md p-4 rounded-xl border border-cuephoria-purple/20 animate-scale-in" style={{animationDelay: '100ms'}}>
              <div className="text-sm text-gray-400">PS5 Consoles</div>
              <div className="text-2xl font-bold text-white mt-1">{ps5Stations.length}</div>
              <div className="text-xs text-green-400 mt-1">{ps5Stations.filter(s => !s.isOccupied).length} available</div>
            </div>
            <div className="bg-gradient-to-br from-green-900/30 to-green-900/5 backdrop-blur-md p-4 rounded-xl border border-green-800/20 animate-scale-in" style={{animationDelay: '200ms'}}>
              <div className="text-sm text-gray-400">Pool Tables</div>
              <div className="text-2xl font-bold text-white mt-1">{ballStations.length}</div>
              <div className="text-xs text-green-400 mt-1">{ballStations.filter(s => !s.isOccupied).length} available</div>
            </div>
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/5 backdrop-blur-md p-4 rounded-xl border border-blue-800/20 animate-scale-in" style={{animationDelay: '300ms'}}>
              <div className="text-sm text-gray-400">In Use</div>
              <div className="text-2xl font-bold text-white mt-1">
                {stations.filter(s => s.isOccupied).length}
              </div>
              <div className="text-xs text-orange-400 mt-1">
                {Math.round(stations.filter(s => s.isOccupied).length / stations.length * 100)}% occupancy
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-800/10 backdrop-blur-md p-4 rounded-xl border border-gray-700/30 animate-scale-in" style={{animationDelay: '400ms'}}>
              <div className="text-sm text-gray-400">Network Status</div>
              <div className="text-md font-bold text-white mt-1 flex items-center">
                <Wifi className="h-4 w-4 text-green-400 mr-1.5 animate-pulse-soft" /> Online
              </div>
              <div className="text-xs text-green-400 mt-1">Excellent connection</div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content with transition effects */}
      <main className="py-6 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto transition-all duration-500 ease-in-out" 
        style={{ 
          opacity: refreshing ? 0.7 : 1,
          transform: refreshing ? 'scale(0.99)' : 'scale(1)'
        }}>
        {/* PlayStation Section */}
        <section className="mb-12 animate-slide-up">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-cuephoria-purple/20 flex items-center justify-center mr-3 animate-pulse-soft">
              <Gamepad2 className="h-5 w-5 text-cuephoria-lightpurple" />
            </div>
            <h2 className="text-2xl font-bold text-white">PlayStation 5 Consoles</h2>
          </div>
          
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {ps5Stations.length === 0 ? (
              <p className="text-gray-400 col-span-full text-center py-10">No PS5 consoles available at this location</p>
            ) : (
              ps5Stations.map((station, index) => (
                <div 
                  key={station.id} 
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <PublicStationCard 
                    station={station} 
                    onBookStation={handleBookStation}
                  />
                </div>
              ))
            )}
          </div>
        </section>
        
        {/* Pool Tables Section */}
        <section className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-900/30 flex items-center justify-center mr-3 animate-pulse-soft">
              <Timer className="h-5 w-5 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white">8-Ball Pool Tables</h2>
          </div>
          
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {ballStations.length === 0 ? (
              <p className="text-gray-400 col-span-full text-center py-10">No pool tables available at this location</p>
            ) : (
              ballStations.map((station, index) => (
                <div 
                  key={station.id} 
                  className="animate-scale-in"
                  style={{ animationDelay: `${(index + ps5Stations.length) * 100}ms` }}
                >
                  <PublicStationCard 
                    station={station} 
                    onBookStation={handleBookStation}
                  />
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 md:px-8 border-t border-gray-800/50 mt-6 backdrop-blur-md bg-black/30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img 
              src="/lovable-uploads/61f60a38-12c2-4710-b1c8-0000eb74593c.png"
              alt="Cuephoria Logo" 
              className="h-8 mr-3" 
            />
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Cuephoria. All rights reserved.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-400 text-sm">
              <Clock className="h-4 w-4 text-gray-400 mr-1.5" />
              <span>Auto-refreshes every 30s</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Booking Dialog */}
      {selectedStation && (
        <BookingDialog 
          open={bookingDialogOpen} 
          onOpenChange={setBookingDialogOpen}
          station={selectedStation}
        />
      )}
    </div>
  );
};

// Enhanced Loading View Component
const ImprovedLoadingView = ({ error }: { error: string | null }) => {
  // Add a state to automatically trigger auto-retry after a short delay
  const [retryCount, setRetryCount] = useState(0);
  
  useEffect(() => {
    // Attempt auto-retry only 3 times max
    if (error && retryCount < 3) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        window.location.reload();
      }, 3000); // Try again after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black flex items-center justify-center">
      <div className="w-full max-w-md flex flex-col items-center justify-center animate-fade-in">
        <div className="w-32 h-32 mb-8 flex items-center justify-center">
          <img 
            src="/lovable-uploads/61f60a38-12c2-4710-b1c8-0000eb74593c.png" 
            alt="Cuephoria Logo" 
            className="animate-flip-in"
          />
        </div>
        
        {error ? (
          <div className="text-center space-y-4 bg-gray-900/60 p-8 rounded-xl backdrop-blur-md border border-red-900/30">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-900/20 mb-4">
              <div className="w-8 h-8 text-red-400 animate-pulse">❌</div>
            </div>
            <h2 className="text-xl font-semibold text-red-400">{error}</h2>
            <p className="text-gray-400">Please try again or contact support</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-4 py-2 bg-cuephoria-purple text-white rounded-lg hover:bg-cuephoria-purple/90 transition-all flex items-center justify-center"
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Retry
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4 animate-fade-in flex flex-col items-center">
            <div className="relative flex justify-center items-center">
              <div className="w-20 h-20 border-t-4 border-cuephoria-lightpurple border-solid rounded-full animate-spin"></div>
              <div className="w-16 h-16 border-t-4 border-r-4 border-transparent border-solid rounded-full border-r-cuephoria-purple absolute animate-spin-slow"></div>
              <div className="absolute">
                <img 
                  src="/lovable-uploads/61f60a38-12c2-4710-b1c8-0000eb74593c.png" 
                  alt="Cuephoria Logo" 
                  className="h-10 w-12 animate-pulse-soft"
                />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-purple animate-text-gradient mt-4">
              Loading stations...
            </h2>
            <p className="text-gray-400">Getting real-time information</p>
          </div>
        )}
      </div>
    </div>
  );
};

// No Stations View
const NoStationsView = ({ error }: { error: string | null }) => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 to-black flex items-center justify-center">
      <div className="w-full max-w-md py-12 px-6 flex flex-col items-center justify-center animate-fade-in">
        <div className="w-32 h-32 mb-8 flex items-center justify-center">
          <img 
            src="/lovable-uploads/61f60a38-12c2-4710-b1c8-0000eb74593c.png" 
            alt="Cuephoria Logo"
            className="animate-float" 
          />
        </div>
        
        <div className="text-center space-y-4 bg-gray-900/60 p-8 rounded-xl backdrop-blur-md border border-gray-800/50">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-900/20 mb-4">
            <div className="w-8 h-8 text-yellow-400">⚠️</div>
          </div>
          <h2 className="text-xl font-semibold text-white">No Stations Available</h2>
          <p className="text-gray-400">
            {error || "There are currently no gaming stations in our system. Please check back later."}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-cuephoria-purple text-white rounded-lg hover:bg-cuephoria-purple/90 transition-all flex items-center justify-center"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

// Station Card Component with enhanced animations and booking button
const PublicStationCard = ({ 
  station, 
  onBookStation 
}: { 
  station: Station; 
  onBookStation: (station: Station) => void;
}) => {
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
      relative overflow-hidden rounded-xl border group transition-all duration-500
      ${isPoolTable 
        ? 'bg-gradient-to-br from-green-900/40 to-black border-green-800/50'
        : 'bg-gradient-to-br from-cuephoria-purple/30 to-black border-cuephoria-purple/40'
      }
      hover:shadow-lg ${isPoolTable ? 'hover:shadow-green-900/30' : 'hover:shadow-cuephoria-purple/20'}
      hover:-translate-y-1 hover:scale-[1.02]
    `}>
      {/* Animated glow effect for available stations */}
      {!station.isOccupied && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity"></div>
      )}
      
      {/* Content */}
      <div className="p-5 relative z-10">
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`
            px-2.5 py-1 text-xs font-medium rounded-full backdrop-blur-sm transition-all duration-300
            ${station.isOccupied
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : 'bg-green-500/20 text-green-300 border border-green-500/30 animate-pulse-soft'}
          `}>
            {station.isOccupied ? 'Occupied' : 'Available'}
          </span>
        </div>
        
        {/* Station Icon and Name */}
        <div className="flex items-center mb-4 mt-2">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center mr-3
            ${isPoolTable ? 'bg-green-900/50' : 'bg-cuephoria-purple/40'}
            group-hover:scale-110 transition-transform duration-300
          `}>
            {isPoolTable ? (
              <Timer className="h-6 w-6 text-green-400" />
            ) : (
              <Monitor className="h-6 w-6 text-cuephoria-lightpurple" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-white">{station.consolidatedName || station.name}</h3>
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
              border border-gray-800/50 backdrop-blur-sm
            `}>
              {duration.formatted}
            </div>
            
            {/* Visual progress bar */}
            <div className="mt-3 h-1 bg-gray-800/70 rounded-full overflow-hidden">
              <div 
                className={`h-full ${isPoolTable ? 'bg-green-500' : 'bg-cuephoria-lightpurple'} rounded-full`}
                style={{ 
                  width: `${Math.min(((duration.hours * 60 + duration.minutes) / 240) * 100, 100)}%`,
                  transition: 'width 1s linear'
                }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Available message and booking button */}
        {!station.isOccupied && (
          <div className="mt-4">
            <div className="py-3 px-2 text-center bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-lg">
              <p className={`
                text-sm font-medium animate-pulse-soft mb-2
                ${isPoolTable ? 'text-green-400' : 'text-cuephoria-lightpurple'}
              `}>
                Ready for next player!
              </p>
              
              {/* Booking button */}
              <Button 
                className={`w-full mt-2 ${
                  isPoolTable ? 'bg-green-600 hover:bg-green-700' : 'bg-cuephoria-purple hover:bg-cuephoria-purple/90'
                }`}
                onClick={() => onBookStation(station)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book a Slot
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicStations;
