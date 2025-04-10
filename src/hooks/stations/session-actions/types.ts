
import { Station, Session, Customer } from '@/types/pos.types';

export interface SessionActionsProps {
  stations: Station[];
  setStations: React.Dispatch<React.SetStateAction<Station[]>>;
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  updateCustomer?: (customer: Customer) => void; // Added updateCustomer as optional prop
}
