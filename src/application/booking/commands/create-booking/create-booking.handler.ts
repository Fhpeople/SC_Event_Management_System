import { randomUUID } from 'crypto';
import { CreateBookingCommand } from './create-booking.command';
import { IEventRepository } from '../../../../domain/event/event.repository';
import { IBookingRepository } from '../../../../domain/booking/booking.repository';
import { Booking } from '../../../../domain/booking/booking.aggregate';
import { Money } from '../../../../domain/shared/money.value-object';
import { EventStatus } from '../../../../domain/event/event-status.enum';

export class CreateBookingHandler {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(command: CreateBookingCommand): Promise<string> {
    const event = await this.eventRepository.findById(command.eventId);
    if (!event) {
      throw new Error(`Event with id ${command.eventId} not found`);
    }

    if (event.status !== EventStatus.Published) {
      throw new Error('Booking can only be created for a Published event');
    }

    const ticketCategory = event.ticketCategories.find(
      (tc) => tc.getId() === command.ticketCategoryId,
    );
    if (!ticketCategory) {
      throw new Error(`Ticket category ${command.ticketCategoryId} not found`);
    }

    if (!ticketCategory.isActive) {
      throw new Error('Booking can only be created for an active ticket category');
    }

    if (!ticketCategory.salesPeriod.isCurrentlyActive()) {
      throw new Error('Booking can only be created within the ticket sales period');
    }

    if (command.quantity > ticketCategory.remainingQuota) {
      throw new Error(
        `Requested quantity ${command.quantity} exceeds remaining quota ${ticketCategory.remainingQuota}`,
      );
    }

    const existingBooking = await this.bookingRepository.findActiveByCustomerAndEvent(
      command.customerId,
      command.eventId,
    );
    if (existingBooking) {
      throw new Error('Customer already has an active booking for this event');
    }

    const bookingId = randomUUID();
    const booking = Booking.create({
      id: bookingId,
      customerId: command.customerId,
      eventId: command.eventId,
      ticketCategoryId: command.ticketCategoryId,
      quantity: command.quantity,
      unitPrice: new Money(ticketCategory.price.amount, ticketCategory.price.currency),
    });

    ticketCategory.reserveQuota(command.quantity);

    await this.bookingRepository.save(booking);
    await this.eventRepository.update(event);

    return bookingId;
  }
}