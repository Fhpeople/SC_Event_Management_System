import { ValueObject } from '../shared/value-object.base';

interface TicketQuantityProps {
  value: number;
}

export class TicketQuantity extends ValueObject<TicketQuantityProps> {
  constructor(value: number) {
    if (value <= 0) {
      throw new Error('Ticket quantity must be greater than zero');
    }
    if (!Number.isInteger(value)) {
      throw new Error('Ticket quantity must be a whole number');
    }
    super({ value });
  }

  get value(): number {
    return this.props.value;
  }
}

interface PaymentDeadlineProps {
  value: Date;
}

export class PaymentDeadline extends ValueObject<PaymentDeadlineProps> {
  constructor(value: Date) {
    super({ value });
  }

  get value(): Date {
    return this.props.value;
  }

  static fromNow(minutes: number = 15): PaymentDeadline {
    const deadline = new Date();
    deadline.setMinutes(deadline.getMinutes() + minutes);
    return new PaymentDeadline(deadline);
  }

  isExpired(): boolean {
    return new Date() > this.props.value;
  }
}