import { Refund, CreateRefundProps } from '../../../domain/refund/refund.aggregate';
import { RefundStatus } from '../../../domain/refund/refund-status.enum';
import { Money } from '../../../domain/shared/money.value-object';
import { CannotRequestRefundError } from '../../../domain/refund/refund.errors';
import { RefundRequestedEvent } from '../../../domain/refund/events/refund-requested.event';
import { RefundApprovedEvent } from '../../../domain/refund/events/refund-approved.event';
import { CannotApproveRefundError, CannotRejectRefundError } from '../../../domain/refund/refund.errors';
import { RefundRejectedEvent } from '../../../domain/refund/events/refund-rejected.event';
import { RefundPaidOutEvent } from '../../../domain/refund/events/refund-paid-out.event';
import { CannotMarkRefundAsPaidOutError } from '../../../domain/refund/refund.errors';

const makeValidRefundProps = (): CreateRefundProps => ({
  id: 'refund-001',
  bookingId: 'booking-001',
  customerId: 'customer-001',
  amount: new Money(300_000, 'IDR'),
  hasCheckedInTickets: false,
});

describe('Refund Aggregate', () => {

  describe('UC15 - create()', () => {
    it('should create a refund with status Requested', () => {
      const refund = Refund.create(makeValidRefundProps());
      expect(refund.status).toBe(RefundStatus.Requested);
    });

    it('should raise RefundRequestedEvent after creation', () => {
      const refund = Refund.create(makeValidRefundProps());
      const domainEvents = refund.pullDomainEvents();
      expect(domainEvents).toHaveLength(1);
      expect(domainEvents[0]).toBeInstanceOf(RefundRequestedEvent);
    });

    it('should store correct bookingId, customerId, and amount', () => {
      const refund = Refund.create(makeValidRefundProps());
      expect(refund.bookingId).toBe('booking-001');
      expect(refund.customerId).toBe('customer-001');
      expect(refund.amount.amount).toBe(300_000);
    });

    it('should throw if any ticket has already been checked in', () => {
      expect(() =>
        Refund.create({
          ...makeValidRefundProps(),
          hasCheckedInTickets: true,
        }),
      ).toThrow(CannotRequestRefundError);
    });
  });

  describe('UC16 - approve()', () => {
    it('should change status to Approved', () => {
      const refund = Refund.create(makeValidRefundProps());
      refund.approve();
      expect(refund.status).toBe(RefundStatus.Approved);
    });

    it('should raise RefundApprovedEvent after approval', () => {
      const refund = Refund.create(makeValidRefundProps());
      refund.pullDomainEvents();
      refund.approve();
      const domainEvents = refund.pullDomainEvents();
      expect(domainEvents).toHaveLength(1);
      expect(domainEvents[0]).toBeInstanceOf(RefundApprovedEvent);
    });

    it('should throw if refund status is not Requested', () => {
      const refund = Refund.create(makeValidRefundProps());
      refund.approve();
      expect(() => refund.approve()).toThrow(CannotApproveRefundError);
    });

    it('should throw if refund is already Rejected', () => {
      const refund = Refund.create(makeValidRefundProps());
      (refund as any).props.status = RefundStatus.Rejected;
      expect(() => refund.approve()).toThrow(CannotApproveRefundError);
    });
  });

  describe('UC17 - reject()', () => {
    it('should change status to Rejected', () => {
      const refund = Refund.create(makeValidRefundProps());
      refund.reject('Customer violated refund policy');
      expect(refund.status).toBe(RefundStatus.Rejected);
    });

    it('should raise RefundRejectedEvent after rejection', () => {
      const refund = Refund.create(makeValidRefundProps());
      refund.pullDomainEvents();
      refund.reject('Customer violated refund policy');
      const domainEvents = refund.pullDomainEvents();
      expect(domainEvents).toHaveLength(1);
      expect(domainEvents[0]).toBeInstanceOf(RefundRejectedEvent);
    });

    it('should store rejection reason', () => {
      const refund = Refund.create(makeValidRefundProps());
      refund.reject('Customer violated refund policy');
      expect(refund.reason?.value).toBe('Customer violated refund policy');
    });

    it('should throw if reason is empty', () => {
      const refund = Refund.create(makeValidRefundProps());
      expect(() => refund.reject('')).toThrow('Refund reason cannot be empty');
    });

    it('should throw if reason is whitespace only', () => {
      const refund = Refund.create(makeValidRefundProps());
      expect(() => refund.reject('   ')).toThrow('Refund reason cannot be empty');
    });

    it('should throw if refund status is not Requested', () => {
      const refund = Refund.create(makeValidRefundProps());
      refund.approve();
      expect(() => refund.reject('some reason')).toThrow(CannotRejectRefundError);
    });
  });

  describe('UC18 - markAsPaidOut()', () => {
    it('should change status to PaidOut', () => {
      const refund = Refund.create(makeValidRefundProps());
      refund.approve();
      refund.markAsPaidOut('PAY-REF-001');
      expect(refund.status).toBe(RefundStatus.PaidOut);
    });

    it('should raise RefundPaidOutEvent after payout', () => {
      const refund = Refund.create(makeValidRefundProps());
      refund.approve();
      refund.pullDomainEvents();
      refund.markAsPaidOut('PAY-REF-001');
      const domainEvents = refund.pullDomainEvents();
      expect(domainEvents).toHaveLength(1);
      expect(domainEvents[0]).toBeInstanceOf(RefundPaidOutEvent);
    });

    it('should store payment reference', () => {
      const refund = Refund.create(makeValidRefundProps());
      refund.approve();
      refund.markAsPaidOut('PAY-REF-001');
      expect(refund.paymentReference?.value).toBe('PAY-REF-001');
    });

    it('should throw if payment reference is empty', () => {
      const refund = Refund.create(makeValidRefundProps());
      refund.approve();
      expect(() => refund.markAsPaidOut('')).toThrow('Payment reference cannot be empty');
    });

    it('should throw if refund status is not Approved', () => {
      const refund = Refund.create(makeValidRefundProps());
      expect(() => refund.markAsPaidOut('PAY-REF-001')).toThrow(CannotMarkRefundAsPaidOutError);
    });

    it('should throw if refund is already PaidOut', () => {
      const refund = Refund.create(makeValidRefundProps());
      refund.approve();
      refund.markAsPaidOut('PAY-REF-001');
      expect(() => refund.markAsPaidOut('PAY-REF-002')).toThrow(CannotMarkRefundAsPaidOutError);
    });

    it('should throw if refund is Rejected', () => {
      const refund = Refund.create(makeValidRefundProps());
      refund.reject('Policy violation');
      expect(() => refund.markAsPaidOut('PAY-REF-001')).toThrow(CannotMarkRefundAsPaidOutError);
    });
  });

});