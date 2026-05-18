import { DomainEvent } from '../../shared/domain-event.base';
import { Money } from '../../shared/money.value-object';

export class TicketCategoryCreatedEvent extends DomainEvent {
  constructor(
    public readonly ticketCategoryId: string,
    public readonly eventId: string,
    public readonly name: string,
    public readonly quota: number,
    public readonly price: Money,
  ) {
    super();
  }
}