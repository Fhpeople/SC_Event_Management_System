import { DomainEvent } from '../../shared/domain-event.base';

export class RefundRequestedEvent extends DomainEvent {
  constructor(
    public readonly refundId: string,
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly amount: number,
  ) {
    super();
  }
}