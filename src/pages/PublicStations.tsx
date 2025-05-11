
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Monitor, Clock, Timer, Wifi, Gamepad2, RefreshCcw, Phone, Mail, Clock3 } from 'lucide-react';
import { Station, Session } from '@/types/pos.types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const PublicStations = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [timeToNextRefresh, setTimeToNextRefresh] = useState(30);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Group controllers by main station
  const getGroupedStations = (allStations: Station[]) => {
    const ps5Stations: { [key: string]: { station: Station, controllers: Station[] } } = {
      'Team Blue': { 
        station: {
          id: 'team-blue',
          name: 'Team Blue',
          type: 'ps5',
          hourlyRate: 0,
          isOccupied: false,
          currentSession: null
        },
        controllers: []
      },
      'Team Red': { 
        station: {
          id: 'team-red',
          name: 'Team Red',
          type: 'ps5',
          hourlyRate: 0,
          isOccupied: false,
          currentSession: null
        },
        controllers: []
      }
    };
    
    // Filter PS5 controllers and assign them to the appropriate team
    const ps5Controllers = allStations.filter(s => s.type === 'ps5');
    
    ps5Controllers.forEach(controller => {
      const controllerNumber = parseInt((controller.name.match(/\d+/) || ['0'])[0]);
      
      if (controllerNumber <= 3) {
        // Controllers 1-3 belong to Team Blue
        ps5Stations['Team Blue'].controllers.push(controller);
        // If any controller is occupied, mark the station as occupied
        if (controller.isOccupied) {
          ps5Stations['Team Blue'].station.isOccupied = true;
        }
      } else {
        // Controllers 4-6 belong to Team Red
        ps5Stations['Team Red'].controllers.push(controller);
        // If any controller is occupied, mark the station as occupied
        if (controller.isOccupied) {
          ps5Stations['Team Red'].station.isOccupied = true;
        }
      }
    });
    
    return ps5Stations;
  };

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
          currentSession: null
        })) || [];
        
        const transformedSessions: Session[] = sessionsData?.map(item => ({
          id: item.id,
          stationId: item.station_id,
          customerId: item.customer_id,
          startTime: new Date(item.start_time),
          endTime: item.end_time ? new Date(item.end_time) : undefined,
          duration: item.duration
        })) || [];
        
        // Connect sessions to stations
        const stationsWithSessions = transformedStations.map(station => {
          const activeSession = transformedSessions.find(s => s.stationId === station.id);
          
          return {
            ...station,
            isOccupied: !!activeSession,
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
    
    // Handle visibility change to refresh data when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing sessions...');
        fetchData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

  // Separate stations by type and group PS5 controllers by team
  const ballStations = stations.filter(station => station.type === '8ball');
  const ps5StationGroups = getGroupedStations(stations);
  const mainPS5Stations = Object.values(ps5StationGroups).map(group => group.station);

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
              <div className="text-sm text-gray-400">PS5 Stations</div>
              <div className="text-2xl font-bold text-white mt-1">{2}</div>
              <div className="text-xs text-green-400 mt-1">{mainPS5Stations.filter(s => !s.isOccupied).length} available</div>
            </div>
            <div className="bg-gradient-to-br from-green-900/30 to-green-900/5 backdrop-blur-md p-4 rounded-xl border border-green-800/20 animate-scale-in" style={{animationDelay: '200ms'}}>
              <div className="text-sm text-gray-400">Pool Tables</div>
              <div className="text-2xl font-bold text-white mt-1">{ballStations.length}</div>
              <div className="text-xs text-green-400 mt-1">{ballStations.filter(s => !s.isOccupied).length} available</div>
            </div>
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-900/5 backdrop-blur-md p-4 rounded-xl border border-blue-800/20 animate-scale-in" style={{animationDelay: '300ms'}}>
              <div className="text-sm text-gray-400">In Use</div>
              <div className="text-2xl font-bold text-white mt-1">
                {mainPS5Stations.filter(s => s.isOccupied).length + ballStations.filter(s => s.isOccupied).length}
              </div>
              <div className="text-xs text-orange-400 mt-1">
                {Math.round(
                  (mainPS5Stations.filter(s => s.isOccupied).length + ballStations.filter(s => s.isOccupied).length) / 
                  (mainPS5Stations.length + ballStations.length) * 100
                )}% occupancy
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
            <h2 className="text-2xl font-bold text-white">PlayStation 5 Stations</h2>
          </div>
          
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-2">
            {Object.entries(ps5StationGroups).map(([teamName, { station, controllers }], index) => (
              <div 
                key={station.id} 
                className="animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <TeamStationCard 
                  station={station} 
                  controllersCount={controllers.length}
                  activeControllers={controllers.filter(c => c.isOccupied).length}
                />
              </div>
            ))}
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
          
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {ballStations.length === 0 ? (
              <p className="text-gray-400 col-span-full text-center py-10">No pool tables available at this location</p>
            ) : (
              ballStations.map((station, index) => (
                <div 
                  key={station.id} 
                  className="animate-scale-in"
                  style={{ animationDelay: `${(index + Object.keys(ps5StationGroups).length) * 100}ms` }}
                >
                  <PublicStationCard station={station} />
                </div>
              ))
            )}
          </div>
        </section>
        
        {/* Contact Information */}
        <section className="mt-16 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-900/30 flex items-center justify-center mr-3">
              <Phone className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Contact Information</h2>
          </div>
          
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-5 rounded-xl border border-gray-700/30 backdrop-blur-md flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center mr-3">
                  <Phone className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Phone</h3>
                  <a href="tel:+918637625155" className="text-blue-400 hover:text-blue-300 transition-colors">
                    +91 86376 25155
                  </a>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Call us for WhatsApp booking enquiries
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-5 rounded-xl border border-gray-700/30 backdrop-blur-md flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center mr-3">
                  <Mail className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Email</h3>
                  <a href="mailto:contact@cuephoria.in" className="text-green-400 hover:text-green-300 transition-colors">
                    contact@cuephoria.in
                  </a>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                Send us an email for general inquiries
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-5 rounded-xl border border-gray-700/30 backdrop-blur-md flex flex-col">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center mr-3">
                  <Clock3 className="h-5 w-5 text-cuephoria-lightpurple" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">Business Hours</h3>
                  <p className="text-cuephoria-lightpurple">
                    11:00 AM - 11:00 PM
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                We're open 7 days a week
              </p>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer with WhatsApp button */}
      <footer className="py-8 px-4 sm:px-6 md:px-8 border-t border-gray-800/50 mt-6 backdrop-blur-md bg-black/30 relative">
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
        
        {/* WhatsApp floating button for mobile */}
        <a 
          href="https://wa.me/918637625155?text=Hi%20Cuephoria%2C%20I%20would%20like%20to%20book%20a%20gaming%20station" 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all z-50 animate-bounce-slow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
        </a>
      </footer>
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

// PS5 Team Card Component
const TeamStationCard = ({ 
  station, 
  controllersCount, 
  activeControllers 
}: { 
  station: Station, 
  controllersCount: number,
  activeControllers: number
}) => {
  return (
    <div className={`
      relative overflow-hidden rounded-xl border transition-all duration-500
      bg-gradient-to-br from-cuephoria-purple/30 to-black border-cuephoria-purple/40
      hover:shadow-lg hover:shadow-cuephoria-purple/20
      hover:-translate-y-1 hover:scale-[1.02] h-full
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
            {station.isOccupied ? 'In Use' : 'Available'}
          </span>
        </div>
        
        {/* Station Icon and Name */}
        <div className="flex items-center mb-4 mt-2">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center mr-3
            bg-cuephoria-purple/40
            group-hover:scale-110 transition-transform duration-300
          `}>
            <Gamepad2 className="h-6 w-6 text-cuephoria-lightpurple" />
          </div>
          <h3 className="text-2xl font-semibold text-white">{station.name}</h3>
        </div>

        {/* Controllers status */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Controllers:</span>
            <span className={`font-medium ${station.isOccupied ? 'text-red-400' : 'text-green-400'}`}>
              {activeControllers} / {controllersCount} in use
            </span>
          </div>
          
          {/* Controllers visual representation */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[...Array(controllersCount)].map((_, i) => {
              const isActive = i < activeControllers;
              return (
                <div 
                  key={i}
                  className={`
                    aspect-square rounded-md flex items-center justify-center
                    ${isActive ? 'bg-red-900/30 border-red-500/30' : 'bg-green-900/30 border-green-500/30'}
                    border p-2 transition-all
                  `}
                >
                  <Gamepad2 
                    className={`w-full h-full ${isActive ? 'text-red-400' : 'text-green-400'}`}
                  />
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Message */}
        <div className="mt-6 py-3 px-2 text-center rounded-lg border border-gray-800/40 bg-gray-900/40">
          <p className={`text-sm font-medium ${station.isOccupied ? 'text-amber-400' : 'text-green-400'}`}>
            {station.isOccupied 
              ? `Station currently in use. ${controllersCount - activeControllers} controllers available.` 
              : "All controllers available! Ready for action."}
          </p>
        </div>
      </div>
    </div>
  );
};

// Station Card Component with enhanced animations for 8Ball tables
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
        
        {/* Available message if not occupied */}
        {!station.isOccupied && (
          <div className="mt-4 py-3 px-2 text-center bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-lg">
            <p className={`
              text-sm font-medium animate-pulse-soft
              ${isPoolTable ? 'text-green-400' : 'text-cuephoria-lightpurple'}
            `}>
              Ready for next player!
            </p>
            
            {/* Availability indicator dots */}
            <div className="flex items-center justify-center space-x-1 mt-2">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${isPoolTable ? 'bg-green-400' : 'bg-cuephoria-lightpurple'}`}
                  style={{ 
                    animationDelay: `${i * 200}ms`,
                    animation: 'pulse 1.5s infinite ease-in-out'
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicStations;
