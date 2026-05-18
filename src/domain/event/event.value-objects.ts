import { ValueObject } from '../shared/value-object.base';

interface EventNameProps {
  value: string;
}

export class EventName extends ValueObject<EventNameProps> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Event name cannot be empty');
    }
    super({ value: value.trim() });
  }

  get value(): string {
    return this.props.value;
  }
}

interface EventDescriptionProps {
  value: string;
}

export class EventDescription extends ValueObject<EventDescriptionProps> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Event description cannot be empty');
    }
    super({ value: value.trim() });
  }

  get value(): string {
    return this.props.value;
  }
}

interface EventLocationProps {
  value: string;
}

export class EventLocation extends ValueObject<EventLocationProps> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Event location cannot be empty');
    }
    super({ value: value.trim() });
  }

  get value(): string {
    return this.props.value;
  }
}

interface EventCapacityProps {
  value: number;
}

export class EventCapacity extends ValueObject<EventCapacityProps> {
  constructor(value: number) {
    if (value <= 0) {
      throw new Error('Event capacity must be greater than zero');
    }
    super({ value });
  }

  get value(): number {
    return this.props.value;
  }
}

interface EventDatesProps {
  startDate: Date;
  endDate: Date;
}

export class EventDates extends ValueObject<EventDatesProps> {
  constructor(startDate: Date, endDate: Date) {
    if (endDate < startDate) {
      throw new Error('End date cannot be earlier than start date');
    }
    super({ startDate, endDate });
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }
}

interface SalesPeriodProps {
  salesStartDate: Date;
  salesEndDate: Date;
}

export class SalesPeriod extends ValueObject<SalesPeriodProps> {
  constructor(salesStartDate: Date, salesEndDate: Date, eventStartDate?: Date) {
    if (salesEndDate < salesStartDate) {
      throw new Error('Sales end date cannot be earlier than sales start date');
    }
    if (eventStartDate && salesEndDate > eventStartDate) {
      throw new Error('Sales end date must be before or on the event start date');
    }
    super({ salesStartDate, salesEndDate });
  }

  get salesStartDate(): Date {
    return this.props.salesStartDate;
  }

  get salesEndDate(): Date {
    return this.props.salesEndDate;
  }

  isCurrentlyActive(): boolean {
    const now = new Date();
    return now >= this.props.salesStartDate && now <= this.props.salesEndDate;
  }

  hasNotStarted(): boolean {
    return new Date() < this.props.salesStartDate;
  }

  hasEnded(): boolean {
    return new Date() > this.props.salesEndDate;
  }
}