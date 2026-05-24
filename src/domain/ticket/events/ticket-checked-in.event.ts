import { DomainEvent } from '../../shared/domain-event.base';

export class TicketCheckedInEvent extends DomainEvent {
  constructor(
    public readonly ticketId: string,
    public readonly ticketCode: string,
    public readonly eventId: string,
    public readonly bookingId: string,
    public readonly checkedInAt: Date,
  ) {
    super();
  }
}