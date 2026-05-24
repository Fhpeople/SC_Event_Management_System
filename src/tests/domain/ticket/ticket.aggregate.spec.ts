import { Ticket, CreateTicketProps } from '../../../domain/ticket/ticket.aggregate';
import { TicketStatus } from '../../../domain/ticket/ticket-status.enum';
import { CannotCheckInTicketError } from '../../../domain/ticket/ticket.errors';
import { TicketCheckedInEvent } from '../../../domain/ticket/events/ticket-checked-in.event';

const EVENT_START_DATE = new Date('2025-09-01');

const makeValidTicketProps = (): CreateTicketProps => ({
  id: 'ticket-001',
  bookingId: 'booking-001',
  eventId: 'event-001',
  eventStartDate: EVENT_START_DATE,
});

const validCheckInTime = new Date('2025-09-01T09:00:00');

describe('Ticket Aggregate', () => {

  describe('create()', () => {
    it('should create a ticket with status Active', () => {
      const ticket = Ticket.create(makeValidTicketProps());
      expect(ticket.status).toBe(TicketStatus.Active);
    });

    it('should generate a unique ticket code', () => {
      const ticket1 = Ticket.create(makeValidTicketProps());
      const ticket2 = Ticket.create({ ...makeValidTicketProps(), id: 'ticket-002' });
      expect(ticket1.ticketCode.value).not.toBe(ticket2.ticketCode.value);
    });

    it('should store correct bookingId and eventId', () => {
      const ticket = Ticket.create(makeValidTicketProps());
      expect(ticket.bookingId).toBe('booking-001');
      expect(ticket.eventId).toBe('event-001');
    });
  });

  describe('UC13 - checkIn()', () => {
    it('should change status to CheckedIn', () => {
      const ticket = Ticket.create(makeValidTicketProps());
      ticket.checkIn('event-001', validCheckInTime);
      expect(ticket.status).toBe(TicketStatus.CheckedIn);
    });

    it('should raise TicketCheckedInEvent after check-in', () => {
      const ticket = Ticket.create(makeValidTicketProps());
      ticket.checkIn('event-001', validCheckInTime);
      const domainEvents = ticket.pullDomainEvents();
      expect(domainEvents).toHaveLength(1);
      expect(domainEvents[0]).toBeInstanceOf(TicketCheckedInEvent);
    });

    it('should record check-in time', () => {
      const ticket = Ticket.create(makeValidTicketProps());
      ticket.checkIn('event-001', validCheckInTime);
      expect(ticket.checkedInAt?.value).toEqual(validCheckInTime);
    });

    it('should throw if ticket belongs to different event', () => {
      const ticket = Ticket.create(makeValidTicketProps());
      expect(() =>
        ticket.checkIn('event-999', validCheckInTime),
      ).toThrow(CannotCheckInTicketError);
    });

    it('should throw if ticket is already CheckedIn', () => {
      const ticket = Ticket.create(makeValidTicketProps());
      ticket.checkIn('event-001', validCheckInTime);
      expect(() =>
        ticket.checkIn('event-001', validCheckInTime),
      ).toThrow(CannotCheckInTicketError);
    });

    it('should throw if ticket is Cancelled', () => {
      const ticket = Ticket.create(makeValidTicketProps());
      ticket.cancel();
      expect(() =>
        ticket.checkIn('event-001', validCheckInTime),
      ).toThrow(CannotCheckInTicketError);
    });

    it('should throw if check-in is not on event day', () => {
      const ticket = Ticket.create(makeValidTicketProps());
      const wrongDay = new Date('2025-09-02T09:00:00');
      expect(() =>
        ticket.checkIn('event-001', wrongDay),
      ).toThrow(CannotCheckInTicketError);
    });
  });

});