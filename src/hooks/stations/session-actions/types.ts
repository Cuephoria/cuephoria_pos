
import { Station, Session, Customer } from '@/types/pos.types';
import { Dispatch, SetStateAction } from 'react';

export interface SessionActionsProps {
  stations: Station[];
  setStations: Dispatch<SetStateAction<Station[]>>;
  sessions: Session[];
  setSessions: Dispatch<SetStateAction<Session[]>>;
  updateCustomer?: (customer: Customer) => Promise<Customer | null>;
}

export interface SessionActionsHook {
  startSession: (stationId: string, customerId: string) => Promise<void>;
  endSession: (stationId: string, customersList?: Customer[]) => Promise<void>;
  pauseSession: (id: string) => Promise<void>;
  resumeSession: (id: string) => Promise<void>;
  addStation: (station: Omit<Station, "id" | "isOccupied" | "createdAt">) => Promise<Station | undefined>;
  updateStation: (station: Station) => Promise<Station | undefined>;
  deleteStation: (id: string) => Promise<void>;
  isLoading: boolean;
}
