import { ValueObject } from '../shared/value-object.base';

interface TicketCodeProps {
  value: string;
}

export class TicketCode extends ValueObject<TicketCodeProps> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Ticket code cannot be empty');
    }
    super({ value: value.trim() });
  }

  get value(): string {
    return this.props.value;
  }

  static generate(): TicketCode {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return new TicketCode(uuid);
  }
}

interface CheckInTimeProps {
  value: Date;
}

export class CheckInTime extends ValueObject<CheckInTimeProps> {
  constructor(value: Date) {
    super({ value });
  }

  get value(): Date {
    return this.props.value;
  }

  isOnEventDay(eventDate: Date): boolean {
    return (
      this.props.value.getFullYear() === eventDate.getFullYear() &&
      this.props.value.getMonth() === eventDate.getMonth() &&
      this.props.value.getDate() === eventDate.getDate()
    );
  }
}