import { AggregateRoot } from '../shared/aggregate-root.base';
import { Money } from '../shared/money.value-object';
import { RefundStatus } from './refund-status.enum';
import { RefundReason, PaymentReference } from './refund.value-objects';
import {
  CannotRequestRefundError,
  CannotApproveRefundError,
  CannotRejectRefundError,
  CannotMarkRefundAsPaidOutError,
} from './refund.errors';
import { RefundRequestedEvent } from './events/refund-requested.event';
import { RefundApprovedEvent } from './events/refund-approved.event';
import { RefundRejectedEvent } from './events/refund-rejected.event';
import { RefundPaidOutEvent } from './events/refund-paid-out.event';

export interface RefundProps {
  bookingId: string;
  customerId: string;
  amount: Money;
  status: RefundStatus;
  reason?: RefundReason;
  paymentReference?: PaymentReference;
  hasCheckedInTickets: boolean;
}

export interface CreateRefundProps {
  id: string;
  bookingId: string;
  customerId: string;
  amount: Money;
  hasCheckedInTickets: boolean;
}

export class Refund extends AggregateRoot {
  private readonly _id: string;
  private props: RefundProps;

  private constructor(id: string, props: RefundProps) {
    super();
    this._id = id;
    this.props = props;
  }

  static create(createProps: CreateRefundProps): Refund {
    if (createProps.hasCheckedInTickets) {
      throw new CannotRequestRefundError(
        'cannot request refund if any ticket has already been checked in',
      );
    }

    const refund = new Refund(createProps.id, {
      bookingId: createProps.bookingId,
      customerId: createProps.customerId,
      amount: createProps.amount,
      status: RefundStatus.Requested,
      hasCheckedInTickets: createProps.hasCheckedInTickets,
    });

    refund.addDomainEvent(
      new RefundRequestedEvent(
        createProps.id,
        createProps.bookingId,
        createProps.customerId,
        createProps.amount.amount,
      ),
    );

    return refund;
  }

  get id(): string {
    return this._id;
  }

  get bookingId(): string {
    return this.props.bookingId;
  }

  get customerId(): string {
    return this.props.customerId;
  }

  get amount(): Money {
    return this.props.amount;
  }

  get status(): RefundStatus {
    return this.props.status;
  }

  get reason(): RefundReason | undefined {
    return this.props.reason;
  }

  get paymentReference(): PaymentReference | undefined {
    return this.props.paymentReference;
  }

  approve(): void {
    if (this.props.status !== RefundStatus.Requested) {
      throw new CannotApproveRefundError(
        `refund status is ${this.props.status}, only Requested refunds can be approved`,
      );
    }

    this.props.status = RefundStatus.Approved;

    this.addDomainEvent(
      new RefundApprovedEvent(
        this._id,
        this.props.bookingId,
        this.props.customerId,
        this.props.amount.amount,
      ),
    );
  }

  reject(reason: string): void {
    if (this.props.status !== RefundStatus.Requested) {
      throw new CannotRejectRefundError(
        `refund status is ${this.props.status}, only Requested refunds can be rejected`,
      );
    }

    const refundReason = new RefundReason(reason);

    this.props.status = RefundStatus.Rejected;
    this.props.reason = refundReason;

    this.addDomainEvent(
      new RefundRejectedEvent(
        this._id,
        this.props.bookingId,
        this.props.customerId,
        refundReason.value,
      ),
    );
  }

  markAsPaidOut(paymentReference: string): void {
    if (this.props.status !== RefundStatus.Approved) {
      throw new CannotMarkRefundAsPaidOutError(
        `refund status is ${this.props.status}, only Approved refunds can be marked as paid out`,
      );
    }

    const reference = new PaymentReference(paymentReference);

    this.props.status = RefundStatus.PaidOut;
    this.props.paymentReference = reference;

    this.addDomainEvent(
      new RefundPaidOutEvent(
        this._id,
        this.props.bookingId,
        this.props.customerId,
        this.props.amount.amount,
        reference.value,
      ),
    );
  }
}