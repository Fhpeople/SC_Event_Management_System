import { DomainEvent } from '../../shared/domain-event.base';

export class RefundApprovedEvent extends DomainEvent {
  constructor(
    public readonly refundId: string,
    public readonly bookingId: string,
    public readonly customerId: string,
    public readonly amount: number,
  ) {
    super();
  }
}