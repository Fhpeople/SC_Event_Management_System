import { Entity } from '../shared/entity.base';
import { Money } from '../shared/money.value-object';
import { SalesPeriod } from './event.value-objects';

export interface TicketCategoryProps {
  name: string;
  price: Money;
  quota: number;
  remainingQuota: number;
  salesPeriod: SalesPeriod;
  isActive: boolean;
}

export class TicketCategory extends Entity<string> {
  private props: TicketCategoryProps;

  constructor(id: string, props: TicketCategoryProps) {
    super(id);

    if (!props.name || props.name.trim().length === 0) {
      throw new Error('Ticket category name cannot be empty');
    }
    if (props.quota <= 0) {
      throw new Error('Ticket quota must be greater than zero');
    }

    this.props = props;
  }

  get name(): string {
    return this.props.name;
  }

  get price(): Money {
    return this.props.price;
  }

  get quota(): number {
    return this.props.quota;
  }

  get remainingQuota(): number {
    return this.props.remainingQuota;
  }

  get salesPeriod(): SalesPeriod {
    return this.props.salesPeriod;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  disable(): void {
    this.props.isActive = false;
  }

  reserveQuota(quantity: number): void {
    if (this.props.remainingQuota < quantity) {
      throw new Error('Not enough remaining quota');
    }
    this.props.remainingQuota -= quantity;
  }

  releaseQuota(quantity: number): void {
    this.props.remainingQuota += quantity;
  }

  isSoldOut(): boolean {
    return this.props.remainingQuota === 0;
  }
}