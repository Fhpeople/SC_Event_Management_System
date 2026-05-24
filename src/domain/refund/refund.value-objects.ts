import { ValueObject } from '../shared/value-object.base';

interface RefundReasonProps {
  value: string;
}

export class RefundReason extends ValueObject<RefundReasonProps> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Refund reason cannot be empty');
    }
    super({ value: value.trim() });
  }

  get value(): string {
    return this.props.value;
  }
}

interface PaymentReferenceProps {
  value: string;
}

export class PaymentReference extends ValueObject<PaymentReferenceProps> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Payment reference cannot be empty');
    }
    super({ value: value.trim() });
  }

  get value(): string {
    return this.props.value;
  }
}