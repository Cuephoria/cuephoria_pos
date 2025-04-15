
import { toast } from "@/components/ui/use-toast";

const CALENDLY_API_KEY = "eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzQ0NzEwMzcxLCJqdGkiOiIyNGQ1Y2FjYy1lZDBhLTQzYjUtODUxMS0yMmNkMzhkNjdjZWQiLCJ1c2VyX3V1aWQiOiI5MTRmMzIwMC04NTMzLTRkZDQtODdjZS0yNjliZjJiYjRlOGUifQ.DFtGh6bSb4IoQatKwHUEtD-cAMWFBAXdh6LN5-PVX8dPjKLzrX0rYROBiz3wR_HSNma_dq70YGsgh8cO-uE2CQ";
const BASE_URL = "https://api.calendly.com";

export interface CalendlyEvent {
  uri: string;
  name: string;
  status: string;
  startTime: string;
  endTime: string;
  location: {
    type: string;
    location?: string;
  };
  cancelUrl?: string;
  rescheduleUrl?: string;
  invitee: {
    name: string;
    email: string;
    timezone: string;
  };
}

// Using the API to fetch real data
export const fetchScheduledEvents = async (
  startDate?: Date,
  endDate?: Date
): Promise<CalendlyEvent[]> => {
  try {
    // Default to current date if not provided
    const start = startDate || new Date();
    const end = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default to 30 days ahead

    const startISO = start.toISOString();
    const endISO = end.toISOString();

    console.log("Fetching Calendly events from API");

    // Make API call to Calendly with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
      const response = await fetch(
        `${BASE_URL}/scheduled_events?min_start_time=${startISO}&max_start_time=${endISO}&status=active&status=canceled`,
        {
          headers: {
            Authorization: `Bearer ${CALENDLY_API_KEY}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal
        }
      );
      
      clearTimeout(timeoutId);
  
      if (!response.ok) {
        console.error(`Error fetching Calendly events: ${response.status} - ${response.statusText}`);
        console.log("Response:", await response.text());
        throw new Error(`Error fetching Calendly events: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("Calendly API Response:", data);
      
      // Check if data structure is as expected
      if (!data.collection || !Array.isArray(data.collection)) {
        console.warn("Unexpected Calendly API response format:", data);
        return [];
      }
      
      // Transform the response to our CalendlyEvent interface
      return data.collection.map((event: any) => ({
        uri: event.uri || "",
        name: event.name || "Unnamed Event",
        status: event.status || "active",
        startTime: event.start_time || new Date().toISOString(),
        endTime: event.end_time || new Date(Date.now() + 3600000).toISOString(),
        location: {
          type: event.location?.type || "physical",
          location: event.location?.location,
        },
        cancelUrl: event.cancellation_url,
        rescheduleUrl: event.reschedule_url,
        invitee: {
          name: event.invitees?.[0]?.name || "Guest",
          email: event.invitees?.[0]?.email || "No email provided",
          timezone: event.invitees?.[0]?.timezone || "UTC",
        },
      }));
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  } catch (error) {
    console.error("Failed to fetch Calendly events:", error);
    // Return empty array instead of mock data
    return [];
  }
};

export const getUpcomingEvents = async (count: number = 5): Promise<CalendlyEvent[]> => {
  try {
    const now = new Date();
    const events = await fetchScheduledEvents(now);
    
    return events
      .filter(event => new Date(event.startTime) > now && event.status === 'active')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, count);
  } catch (error) {
    console.error("Error getting upcoming events:", error);
    return [];
  }
};

export const getTodaysEvents = async (): Promise<CalendlyEvent[]> => {
  try {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    
    const events = await fetchScheduledEvents(now, endOfDay);
    
    return events
      .filter(event => event.status === 'active')
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  } catch (error) {
    console.error("Error getting today's events:", error);
    return [];
  }
};

export const cancelEvent = async (eventUri: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BASE_URL}/scheduled_events/${eventUri}/cancellation`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CALENDLY_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reason: 'Canceled through Cuephoria'
      })
    });

    if (!response.ok) {
      console.error(`Error canceling event: ${response.status} - ${response.statusText}`);
      throw new Error(`Error canceling event: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to cancel Calendly event:', error);
    toast({
      title: "Error",
      description: "Failed to cancel booking",
      variant: "destructive",
    });
    return false;
  }
};
