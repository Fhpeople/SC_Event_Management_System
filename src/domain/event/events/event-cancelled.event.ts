import { DomainEvent } from '../../shared/domain-event.base';

export class EventCancelledEvent extends DomainEvent {
  constructor(
    public readonly eventId: string,
    public readonly organizerId: string,
  ) {
    super();
  }
}