import { DomainEvent } from '../../shared/domain-event.base';

export class RefundPaidOutEvent extends DomainEvent {
  constructor(
    public readonly refundId: string,
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly amount: number,
    public readonly paymentReference: string,
  ) {
    super();
  }
}