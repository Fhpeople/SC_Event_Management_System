import { Booking, CreateBookingProps } from '../../../domain/booking/booking.aggregate';
import { BookingStatus } from '../../../domain/booking/booking-status.enum';
import { Money } from '../../../domain/shared/money.value-object';
import { CannotCreateBookingError } from '../../../domain/booking/booking.errors';
import { TicketReservedEvent } from '../../../domain/booking/events/ticket-reserved.event';
import { BookingPaidEvent } from '../../../domain/booking/events/booking-paid.event';
import { BookingPaymentError, BookingExpireError } from '../../../domain/booking/booking.errors';
import { BookingExpiredEvent } from '../../../domain/booking/events/booking-expired.event';

const makeValidBookingProps = (): CreateBookingProps => ({
  id: 'booking-001',
  customerId: 'customer-001',
  eventId: 'event-001',
  ticketCategoryId: 'tc-001',
  quantity: 2,
  unitPrice: new Money(150_000, 'IDR'),
});

describe('Booking Aggregate', () => {

  describe('UC8 - create()', () => {
    it('should create a booking with status PendingPayment', () => {
      const booking = Booking.create(makeValidBookingProps());
      expect(booking.status).toBe(BookingStatus.PendingPayment);
    });

    it('should raise TicketReservedEvent after creation', () => {
      const booking = Booking.create(makeValidBookingProps());
      const domainEvents = booking.pullDomainEvents();
      expect(domainEvents).toHaveLength(1);
      expect(domainEvents[0]).toBeInstanceOf(TicketReservedEvent);
    });

    it('should set payment deadline 15 minutes from now', () => {
      const before = new Date();
      const booking = Booking.create(makeValidBookingProps());
      const after = new Date();

      const deadlineMs = booking.paymentDeadline.value.getTime();
      const expectedMin = before.getTime() + 14 * 60 * 1000;
      const expectedMax = after.getTime() + 16 * 60 * 1000;

      expect(deadlineMs).toBeGreaterThanOrEqual(expectedMin);
      expect(deadlineMs).toBeLessThanOrEqual(expectedMax);
    });

    it('should throw if quantity is zero', () => {
      expect(() =>
        Booking.create({ ...makeValidBookingProps(), quantity: 0 }),
      ).toThrow('Ticket quantity must be greater than zero');
    });

    it('should throw if quantity is negative', () => {
      expect(() =>
        Booking.create({ ...makeValidBookingProps(), quantity: -1 }),
      ).toThrow('Ticket quantity must be greater than zero');
    });

    it('should store correct eventId, customerId, and ticketCategoryId', () => {
      const booking = Booking.create(makeValidBookingProps());
      expect(booking.eventId).toBe('event-001');
      expect(booking.customerId).toBe('customer-001');
      expect(booking.ticketCategoryId).toBe('tc-001');
    });
  });

  describe('UC9 - totalPrice calculation', () => {
    it('should calculate total price as unit price multiplied by quantity', () => {
      const booking = Booking.create(makeValidBookingProps());
      expect(booking.totalPrice.amount).toBe(300_000);
      expect(booking.totalPrice.currency).toBe('IDR');
    });

    it('should calculate correct total for quantity of 1', () => {
      const booking = Booking.create({
        ...makeValidBookingProps(),
        quantity: 1,
        unitPrice: new Money(500_000, 'IDR'),
      });
      expect(booking.totalPrice.amount).toBe(500_000);
    });

    it('should calculate correct total for larger quantity', () => {
      const booking = Booking.create({
        ...makeValidBookingProps(),
        quantity: 5,
        unitPrice: new Money(200_000, 'IDR'),
      });
      expect(booking.totalPrice.amount).toBe(1_000_000);
    });

    it('total price should use Money value object', () => {
      const booking = Booking.create(makeValidBookingProps());
      expect(booking.totalPrice).toBeInstanceOf(Money);
    });

    it('should throw if unit price is negative', () => {
      expect(() =>
        Booking.create({
          ...makeValidBookingProps(),
          unitPrice: new Money(-1, 'IDR'),
        }),
      ).toThrow('Money amount cannot be negative');
    });
  });

  describe('UC10 - pay()', () => {
    it('should change status to Paid after successful payment', () => {
      const booking = Booking.create(makeValidBookingProps());
      booking.pay(new Money(300_000, 'IDR'));
      expect(booking.status).toBe(BookingStatus.Paid);
    });

    it('should raise BookingPaidEvent after payment', () => {
      const booking = Booking.create(makeValidBookingProps());
      booking.pullDomainEvents();
      booking.pay(new Money(300_000, 'IDR'));
      const domainEvents = booking.pullDomainEvents();
      expect(domainEvents).toHaveLength(1);
      expect(domainEvents[0]).toBeInstanceOf(BookingPaidEvent);
    });

    it('should throw if booking status is not PendingPayment', () => {
      const booking = Booking.create(makeValidBookingProps());
      booking.pay(new Money(300_000, 'IDR'));
      expect(() => booking.pay(new Money(300_000, 'IDR'))).toThrow(BookingPaymentError);
    });

    it('should throw if payment amount does not match total price', () => {
      const booking = Booking.create(makeValidBookingProps());
      expect(() => booking.pay(new Money(200_000, 'IDR'))).toThrow(BookingPaymentError);
    });

    it('should throw if payment deadline has passed', () => {
      const booking = Booking.create(makeValidBookingProps());
      (booking as any).props.paymentDeadline = { value: new Date('2000-01-01'), isExpired: () => true };
      expect(() => booking.pay(new Money(300_000, 'IDR'))).toThrow(BookingPaymentError);
    });
  });

  describe('UC11 - expire()', () => {
    it('should change status to Expired', () => {
      const booking = Booking.create(makeValidBookingProps());
      (booking as any).props.paymentDeadline = { value: new Date('2000-01-01'), isExpired: () => true };
      booking.expire();
      expect(booking.status).toBe(BookingStatus.Expired);
    });

    it('should raise BookingExpiredEvent after expiry', () => {
      const booking = Booking.create(makeValidBookingProps());
      (booking as any).props.paymentDeadline = { value: new Date('2000-01-01'), isExpired: () => true };
      booking.pullDomainEvents();
      booking.expire();
      const domainEvents = booking.pullDomainEvents();
      expect(domainEvents).toHaveLength(1);
      expect(domainEvents[0]).toBeInstanceOf(BookingExpiredEvent);
    });

    it('should throw if booking is already Paid', () => {
      const booking = Booking.create(makeValidBookingProps());
      booking.pay(new Money(300_000, 'IDR'));
      expect(() => booking.expire()).toThrow(BookingExpireError);
    });

    it('should throw if payment deadline has not passed yet', () => {
      const booking = Booking.create(makeValidBookingProps());
      expect(() => booking.expire()).toThrow(BookingExpireError);
    });

    it('BookingExpiredEvent should carry quantity for quota release', () => {
      const booking = Booking.create(makeValidBookingProps());
      (booking as any).props.paymentDeadline = { value: new Date('2000-01-01'), isExpired: () => true };
      booking.pullDomainEvents();
      booking.expire();
      const event = booking.pullDomainEvents()[0] as BookingExpiredEvent;
      expect(event.quantity).toBe(2);
      expect(event.ticketCategoryId).toBe('tc-001');
    });
  });

});