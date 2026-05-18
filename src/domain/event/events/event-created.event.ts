import { DomainEvent } from '../../shared/domain-event.base';

export class EventCreatedEvent extends DomainEvent {
  constructor(
    public readonly eventId: string,
    public readonly organizerId: string,
  ) {
    super();
  }
}