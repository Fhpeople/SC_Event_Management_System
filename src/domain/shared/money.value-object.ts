import { ValueObject } from '../shared/value-object.base';

interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  constructor(amount: number, currency: string = 'IDR') {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
    super({ amount, currency });
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  add(other: Money): Money {
    if (this.props.currency !== other.currency) {
      throw new Error('Cannot add Money with different currencies');
    }
    return new Money(this.props.amount + other.amount, this.props.currency);
  }

  multiply(multiplier: number): Money {
    if (multiplier < 0) {
      throw new Error('Multiplier cannot be negative');
    }
    return new Money(this.props.amount * multiplier, this.props.currency);
  }

  toString(): string {
    return `${this.props.currency} ${this.props.amount.toFixed(2)}`;
  }
}