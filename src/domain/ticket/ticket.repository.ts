import { Ticket } from './ticket.aggregate';

export interface ITicketRepository {
  save(ticket: Ticket): Promise<void>;

  update(ticket: Ticket): Promise<void>;

  findById(id: string): Promise<Ticket | null>;

  findByCode(ticketCode: string): Promise<Ticket | null>;

  findAllByBookingId(bookingId: string): Promise<Ticket[]>;
}