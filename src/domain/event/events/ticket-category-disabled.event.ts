import { DomainEvent } from '../../shared/domain-event.base';

export class TicketCategoryDisabledEvent extends DomainEvent {
  constructor(
    public readonly ticketCategoryId: string,
    public readonly eventId: string,
  ) {
    super();
  }
}