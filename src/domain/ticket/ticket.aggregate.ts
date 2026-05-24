import { AggregateRoot } from '../shared/aggregate-root.base';
import { TicketStatus } from './ticket-status.enum';
import { TicketCode, CheckInTime } from './ticket.value-objects';
import { CannotCheckInTicketError, CannotCancelTicketError } from './ticket.errors';
import { TicketCheckedInEvent } from './events/ticket-checked-in.event';

export interface TicketProps {
  bookingId: string;
  eventId: string;
  eventStartDate: Date;
  ticketCode: TicketCode;
  status: TicketStatus;
  checkedInAt?: CheckInTime;
}

export interface CreateTicketProps {
  id: string;
  bookingId: string;
  eventId: string;
  eventStartDate: Date;
}

export class Ticket extends AggregateRoot {
  private readonly _id: string;
  private props: TicketProps;

  private constructor(id: string, props: TicketProps) {
    super();
    this._id = id;
    this.props = props;
  }

  static create(createProps: CreateTicketProps): Ticket {
    return new Ticket(createProps.id, {
      bookingId: createProps.bookingId,
      eventId: createProps.eventId,
      eventStartDate: createProps.eventStartDate,
      ticketCode: TicketCode.generate(),
      status: TicketStatus.Active,
    });
  }

  get id(): string {
    return this._id;
  }

  get bookingId(): string {
    return this.props.bookingId;
  }

  get eventId(): string {
    return this.props.eventId;
  }

  get ticketCode(): TicketCode {
    return this.props.ticketCode;
  }

  get status(): TicketStatus {
    return this.props.status;
  }

  get checkedInAt(): CheckInTime | undefined {
    return this.props.checkedInAt;
  }

  checkIn(eventId: string, checkInTime: Date): void {
    if (this.props.eventId !== eventId) {
      throw new CannotCheckInTicketError('ticket does not match this event');
    }

    if (this.props.status === TicketStatus.CheckedIn) {
      throw new CannotCheckInTicketError('ticket has already been checked in');
    }

    if (this.props.status !== TicketStatus.Active) {
      throw new CannotCheckInTicketError(
        `ticket status is ${this.props.status}, only Active tickets can be checked in`,
      );
    }

    const checkIn = new CheckInTime(checkInTime);
    if (!checkIn.isOnEventDay(this.props.eventStartDate)) {
      throw new CannotCheckInTicketError(
        'check-in can only be performed on the event day',
      );
    }

    this.props.status = TicketStatus.CheckedIn;
    this.props.checkedInAt = checkIn;

    this.addDomainEvent(
      new TicketCheckedInEvent(
        this._id,
        this.props.ticketCode.value,
        this.props.eventId,
        this.props.bookingId,
        checkInTime,
      ),
    );
  }

  cancel(): void {
    if (this.props.status === TicketStatus.CheckedIn) {
      throw new CannotCancelTicketError('checked-in tickets cannot be cancelled');
    }
    if (this.props.status === TicketStatus.Cancelled) {
      throw new CannotCancelTicketError('ticket is already cancelled');
    }
    this.props.status = TicketStatus.Cancelled;
  }
}