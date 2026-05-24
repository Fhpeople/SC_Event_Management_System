import { Booking } from './booking.aggregate';

export interface IBookingRepository {
  save(booking: Booking): Promise<void>;

  update(booking: Booking): Promise<void>;

  findById(id: string): Promise<Booking | null>;

  findActiveByCustomerAndEvent(
    customerId: string,
    eventId: string,
  ): Promise<Booking | null>;

  findAllExpired(): Promise<Booking[]>;
}