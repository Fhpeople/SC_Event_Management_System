import { DomainEvent } from '../../shared/domain-event.base';

export class RefundRejectedEvent extends DomainEvent {
  constructor(
    public readonly refundId: string,
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly reason: string,
  ) {
    super();
  }
}