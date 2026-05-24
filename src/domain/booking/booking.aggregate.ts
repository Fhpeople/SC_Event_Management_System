import { AggregateRoot } from '../shared/aggregate-root.base';
import { Money } from '../shared/money.value-object';
import { BookingStatus } from './booking-status.enum';
import { TicketQuantity, PaymentDeadline } from './booking.value-objects';
import { CannotCreateBookingError, BookingPaymentError, BookingExpireError } from './booking.errors';
import { TicketReservedEvent } from './events/ticket-reserved.event';
import { BookingPaidEvent } from './events/booking-paid.event';
import { BookingExpiredEvent } from './events/booking-expired.event';

export interface BookingProps {
  customerId: string;
  eventId: string;
  ticketCategoryId: string;
  quantity: TicketQuantity;
  unitPrice: Money;
  totalPrice: Money;
  status: BookingStatus;
  paymentDeadline: PaymentDeadline;
}

export interface CreateBookingProps {
  id: string;
  customerId: string;
  eventId: string;
  ticketCategoryId: string;
  quantity: number;
  unitPrice: Money;
}

export class Booking extends AggregateRoot {
  private readonly _id: string;
  private props: BookingProps;

  private constructor(id: string, props: BookingProps) {
    super();
    this._id = id;
    this.props = props;
  }

  static create(createProps: CreateBookingProps): Booking {
    const quantity = new TicketQuantity(createProps.quantity);
    const totalPrice = createProps.unitPrice.multiply(createProps.quantity);

    if (totalPrice.amount < 0) {
      throw new CannotCreateBookingError('total price cannot be negative');
    }

    const booking = new Booking(createProps.id, {
      customerId: createProps.customerId,
      eventId: createProps.eventId,
      ticketCategoryId: createProps.ticketCategoryId,
      quantity,
      unitPrice: createProps.unitPrice,
      totalPrice,
      status: BookingStatus.PendingPayment,
      paymentDeadline: PaymentDeadline.fromNow(15),
    });

    booking.addDomainEvent(
      new TicketReservedEvent(
        createProps.id,
        createProps.customerId,
        createProps.eventId,
        createProps.ticketCategoryId,
        createProps.quantity,
      ),
    );

    return booking;
  }

  get id(): string {
    return this._id;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get eventId(): string {
    return this.props.eventId;
  }

  get ticketCategoryId(): string {
    return this.props.ticketCategoryId;
  }

  get quantity(): TicketQuantity {
    return this.props.quantity;
  }

  get unitPrice(): Money {
    return this.props.unitPrice;
  }

  get totalPrice(): Money {
    return this.props.totalPrice;
  }

  get status(): BookingStatus {
    return this.props.status;
  }

  get paymentDeadline(): PaymentDeadline {
    return this.props.paymentDeadline;
  }

  pay(paymentAmount: Money): void {
    if (this.props.status !== BookingStatus.PendingPayment) {
      throw new BookingPaymentError(
        `booking status is ${this.props.status}, only PendingPayment bookings can be paid`,
      );
    }

    if (this.props.paymentDeadline.isExpired()) {
      throw new BookingPaymentError('payment deadline has passed');
    }

    if (paymentAmount.amount !== this.props.totalPrice.amount) {
      throw new BookingPaymentError(
        `payment amount ${paymentAmount.amount} does not match total price ${this.props.totalPrice.amount}`,
      );
    }

    this.props.status = BookingStatus.Paid;

    this.addDomainEvent(
      new BookingPaidEvent(
        this._id,
        this.props.customerId,
        this.props.eventId,
        this.props.totalPrice.amount,
      ),
    );
  }

  expire(): void {
    if (this.props.status === BookingStatus.Paid) {
      throw new BookingExpireError('paid bookings cannot be expired');
    }

    if (this.props.status !== BookingStatus.PendingPayment) {
      throw new BookingExpireError(
        `booking status is ${this.props.status}, only PendingPayment bookings can be expired`,
      );
    }

    if (!this.props.paymentDeadline.isExpired()) {
      throw new BookingExpireError('payment deadline has not passed yet');
    }

    this.props.status = BookingStatus.Expired;

    this.addDomainEvent(
      new BookingExpiredEvent(
        this._id,
        this.props.customerId,
        this.props.eventId,
        this.props.ticketCategoryId,
        this.props.quantity.value,
      ),
    );
  }
}