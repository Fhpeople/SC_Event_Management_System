import { Event, CreateEventProps } from '../../../domain/event/event.aggregate';
import { EventStatus } from '../../../domain/event/event-status.enum';
import { Money } from '../../../domain/shared/money.value-object';
import {
  CannotPublishEventError,
  CannotCancelEventError,
  QuotaExceedsCapacityError,
} from '../../../domain/event/event.errors';
import { EventCreatedEvent } from '../../../domain/event/events/event-created.event';
import { EventPublishedEvent } from '../../../domain/event/events/event-published.event';
import { EventCancelledEvent } from '../../../domain/event/events/event-cancelled.event';
import { TicketCategoryCreatedEvent } from '../../../domain/event/events/ticket-category-created.event';
import { TicketCategoryDisabledEvent } from '../../../domain/event/events/ticket-category-disabled.event';
import { CannotDisableTicketCategoryError } from '../../../domain/event/event.errors';

const makeValidEventProps = (): CreateEventProps => ({
  id: 'event-001',
  organizerId: 'organizer-001',
  name: 'Tech Summit 2025',
  description: 'A great tech event',
  location: 'Jakarta Convention Center',
  startDate: new Date('2025-09-01'),
  endDate: new Date('2025-09-02'),
  capacity: 500,
});

const addTicketCategory = (event: Event) => {
  event.addTicketCategory(
    'tc-001',
    'Regular',
    new Money(150_000, 'IDR'),
    100,
    new Date('2025-08-01'),
    new Date('2025-08-31'),
  );
};

describe('Event Aggregate', () => {

  describe('UC1 - create()', () => {
    it('should create an event with status Draft', () => {
      const event = Event.create(makeValidEventProps());
      expect(event.status).toBe(EventStatus.Draft);
    });

    it('should raise EventCreatedEvent after creation', () => {
      const event = Event.create(makeValidEventProps());
      const domainEvents = event.pullDomainEvents();
      expect(domainEvents).toHaveLength(1);
      expect(domainEvents[0]).toBeInstanceOf(EventCreatedEvent);
    });

    it('should throw if end date is earlier than start date', () => {
      expect(() =>
        Event.create({
          ...makeValidEventProps(),
          startDate: new Date('2025-09-02'),
          endDate: new Date('2025-09-01'),
        }),
      ).toThrow('End date cannot be earlier than start date');
    });

    it('should throw if capacity is zero', () => {
      expect(() =>
        Event.create({ ...makeValidEventProps(), capacity: 0 }),
      ).toThrow('Event capacity must be greater than zero');
    });

    it('should throw if capacity is negative', () => {
      expect(() =>
        Event.create({ ...makeValidEventProps(), capacity: -1 }),
      ).toThrow('Event capacity must be greater than zero');
    });

    it('should throw if name is empty', () => {
      expect(() =>
        Event.create({ ...makeValidEventProps(), name: '' }),
      ).toThrow('Event name cannot be empty');
    });
  });

  describe('UC4 - addTicketCategory()', () => {
    it('should add a ticket category to the event', () => {
      const event = Event.create(makeValidEventProps());
      addTicketCategory(event);
      expect(event.ticketCategories).toHaveLength(1);
      expect(event.ticketCategories[0].name).toBe('Regular');
    });

    it('should raise TicketCategoryCreatedEvent after adding category', () => {
      const event = Event.create(makeValidEventProps());
      event.pullDomainEvents();
      addTicketCategory(event);
      const domainEvents = event.pullDomainEvents();
      expect(domainEvents).toHaveLength(1);
      expect(domainEvents[0]).toBeInstanceOf(TicketCategoryCreatedEvent);
    });

    it('should throw if quota exceeds event capacity', () => {
      const event = Event.create(makeValidEventProps());
      expect(() =>
        event.addTicketCategory(
          'tc-001',
          'Regular',
          new Money(150_000, 'IDR'),
          600,
          new Date('2025-08-01'),
          new Date('2025-08-31'),
        ),
      ).toThrow(QuotaExceedsCapacityError);
    });

    it('should throw if sales end date is after event start date', () => {
      const event = Event.create(makeValidEventProps());
      expect(() =>
        event.addTicketCategory(
          'tc-001',
          'Regular',
          new Money(150_000, 'IDR'),
          100,
          new Date('2025-08-01'),
          new Date('2025-09-15'),
        ),
      ).toThrow('Sales end date must be before or on the event start date');
    });

    it('should throw if ticket quota is zero', () => {
      const event = Event.create(makeValidEventProps());
      expect(() =>
        event.addTicketCategory(
          'tc-001',
          'Regular',
          new Money(150_000, 'IDR'),
          0,
          new Date('2025-08-01'),
          new Date('2025-08-31'),
        ),
      ).toThrow('Ticket quota must be greater than zero');
    });

    it('should throw if ticket price is negative', () => {
      const event = Event.create(makeValidEventProps());
      expect(() =>
        event.addTicketCategory(
          'tc-001',
          'Regular',
          new Money(-1, 'IDR'),
          100,
          new Date('2025-08-01'),
          new Date('2025-08-31'),
        ),
      ).toThrow('Money amount cannot be negative');
    });
  });

  describe('UC2 - publish()', () => {
    it('should publish a Draft event that has active ticket categories', () => {
      const event = Event.create(makeValidEventProps());
      addTicketCategory(event);
      event.publish();
      expect(event.status).toBe(EventStatus.Published);
    });

    it('should raise EventPublishedEvent after publishing', () => {
      const event = Event.create(makeValidEventProps());
      addTicketCategory(event);
      event.pullDomainEvents();
      event.publish();
      const domainEvents = event.pullDomainEvents();
      expect(domainEvents).toHaveLength(1);
      expect(domainEvents[0]).toBeInstanceOf(EventPublishedEvent);
    });

    it('should throw if event has no active ticket categories', () => {
      const event = Event.create(makeValidEventProps());
      expect(() => event.publish()).toThrow(CannotPublishEventError);
    });

    it('should throw if event status is Cancelled', () => {
      const event = Event.create(makeValidEventProps());
      addTicketCategory(event);
      event.publish();
      event.cancel();
      expect(() => event.publish()).toThrow(CannotPublishEventError);
    });

    it('should throw if event is already Published', () => {
      const event = Event.create(makeValidEventProps());
      addTicketCategory(event);
      event.publish();
      expect(() => event.publish()).toThrow(CannotPublishEventError);
    });
  });

  describe('UC3 - cancel()', () => {
    it('should cancel a Published event', () => {
      const event = Event.create(makeValidEventProps());
      addTicketCategory(event);
      event.publish();
      event.cancel();
      expect(event.status).toBe(EventStatus.Cancelled);
    });

    it('should raise EventCancelledEvent after cancelling', () => {
      const event = Event.create(makeValidEventProps());
      addTicketCategory(event);
      event.publish();
      event.pullDomainEvents();
      event.cancel();
      const domainEvents = event.pullDomainEvents();
      expect(domainEvents).toHaveLength(1);
      expect(domainEvents[0]).toBeInstanceOf(EventCancelledEvent);
    });

    it('should throw if event is still Draft', () => {
      const event = Event.create(makeValidEventProps());
      expect(() => event.cancel()).toThrow(CannotCancelEventError);
    });

    it('should throw if event is Completed', () => {
      const event = Event.create(makeValidEventProps());
      addTicketCategory(event);
      event.publish();
      (event as any).props.status = EventStatus.Completed;
      expect(() => event.cancel()).toThrow(CannotCancelEventError);
    });

    it('should disable all ticket categories when event is cancelled', () => {
      const event = Event.create(makeValidEventProps());
      addTicketCategory(event);
      event.publish();
      event.cancel();
      event.ticketCategories.forEach((tc) => {
        expect(tc.isActive).toBe(false);
      });
    });

    it('should disable multiple ticket categories when event is cancelled', () => {
      const event = Event.create(makeValidEventProps());
      event.addTicketCategory('tc-001', 'Regular', new Money(150_000, 'IDR'), 100, new Date('2025-08-01'), new Date('2025-08-31'));
      event.addTicketCategory('tc-002', 'VIP', new Money(300_000, 'IDR'), 50, new Date('2025-08-01'), new Date('2025-08-31'));
      event.publish();
      event.cancel();
      expect(event.ticketCategories[0].isActive).toBe(false);
      expect(event.ticketCategories[1].isActive).toBe(false);
    });
  });


  describe('UC5 - disableTicketCategory()', () => {
    it('should disable a ticket category', () => {
      const event = Event.create(makeValidEventProps());
      addTicketCategory(event);
      event.disableTicketCategory('tc-001');
      expect(event.ticketCategories[0].isActive).toBe(false);
    });

    it('should raise TicketCategoryDisabledEvent after disabling', () => {
      const event = Event.create(makeValidEventProps());
      addTicketCategory(event);
      event.pullDomainEvents();
      event.disableTicketCategory('tc-001');
      const domainEvents = event.pullDomainEvents();
      expect(domainEvents).toHaveLength(1);
      expect(domainEvents[0]).toBeInstanceOf(TicketCategoryDisabledEvent);
    });

    it('should throw if event is Completed', () => {
      const event = Event.create(makeValidEventProps());
      addTicketCategory(event);
      event.publish();
      (event as any).props.status = EventStatus.Completed;
      expect(() => event.disableTicketCategory('tc-001')).toThrow(CannotDisableTicketCategoryError);
    });

    it('should throw if ticket category id is not found', () => {
      const event = Event.create(makeValidEventProps());
      addTicketCategory(event);
      expect(() => event.disableTicketCategory('tc-999')).toThrow(CannotDisableTicketCategoryError);
    });

    it('disabled ticket category should still exist for historical purposes', () => {
      const event = Event.create(makeValidEventProps());
      addTicketCategory(event);
      event.disableTicketCategory('tc-001');
      expect(event.ticketCategories).toHaveLength(1);
      expect(event.ticketCategories[0].isActive).toBe(false);
    });
  });

});