import { DomainEvent } from '../../shared/domain-event.base';

export class BookingExpiredEvent extends DomainEvent {
  constructor(
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly eventId: string,
    public readonly ticketCategoryId: string,
    public readonly quantity: number,
  ) {
    super();
  }
}