
import { useState, useEffect } from 'react';

export interface CalendlyEvent {
  uri: string;
  name: string;
  status: string;
  startTime: string;
  endTime: string;
  eventType: string;
  location?: string;
  inviteeEmail?: string;
  inviteeName?: string;
  questions?: { question: string; answer: string }[];
  createdAt: string;
  updatedAt: string;
  canceled: boolean;
  canceler?: string;
}

export interface CalendlyStats {
  upcoming: number;
  past: number;
  canceled: number;
  total: number;
}

const CALENDLY_API_BASE = 'https://api.calendly.com';

export const fetchCalendlyEvents = async (
  token: string, 
  organizationUri: string,
  count = 100,
  status = 'active'
): Promise<CalendlyEvent[]> => {
  try {
    const response = await fetch(
      `${CALENDLY_API_BASE}/scheduled_events?count=${count}&organization=${organizationUri}&status=${status}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Calendly API error: ${response.status}`);
    }

    const data = await response.json();
    return data.collection.map((event: any) => ({
      uri: event.uri,
      name: event.name,
      status: event.status,
      startTime: event.start_time,
      endTime: event.end_time,
      eventType: event.event_type,
      location: event.location?.join(', '),
      createdAt: event.created_at,
      updatedAt: event.updated_at,
      canceled: event.canceled_at !== null,
      canceler: event.canceler_name
    }));
  } catch (error) {
    console.error('Error fetching Calendly events:', error);
    return [];
  }
};

export const getCalendlyStats = async (
  token: string,
  organizationUri: string
): Promise<CalendlyStats> => {
  try {
    const [activeEvents, canceledEvents] = await Promise.all([
      fetchCalendlyEvents(token, organizationUri, 100, 'active'),
      fetchCalendlyEvents(token, organizationUri, 100, 'canceled')
    ]);

    const now = new Date();
    const upcoming = activeEvents.filter(event => new Date(event.startTime) > now).length;
    const past = activeEvents.filter(event => new Date(event.startTime) <= now).length;

    return {
      upcoming,
      past,
      canceled: canceledEvents.length,
      total: activeEvents.length + canceledEvents.length
    };
  } catch (error) {
    console.error('Error getting Calendly stats:', error);
    return { upcoming: 0, past: 0, canceled: 0, total: 0 };
  }
};

// Hook for using Calendly events
export const useCalendlyEvents = (token: string, organizationUri: string) => {
  const [events, setEvents] = useState<CalendlyEvent[]>([]);
  const [stats, setStats] = useState<CalendlyStats>({ upcoming: 0, past: 0, canceled: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const fetchedEvents = await fetchCalendlyEvents(token, organizationUri);
      setEvents(fetchedEvents);
      
      const fetchedStats = await getCalendlyStats(token, organizationUri);
      setStats(fetchedStats);
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch Calendly events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && organizationUri) {
      fetchEvents();
    }
  }, [token, organizationUri]);

  return { events, stats, loading, error, refetch: fetchEvents };
};
