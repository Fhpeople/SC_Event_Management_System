import { randomUUID } from 'crypto';
import { PayBookingCommand } from './pay-booking.command';
import { IBookingRepository } from '../../../../domain/booking/booking.repository';
import { IEventRepository } from '../../../../domain/event/event.repository';
import { ITicketRepository } from '../../../../domain/ticket/ticket.repository';
import { Money } from '../../../../domain/shared/money.value-object';
import { Ticket } from '../../../../domain/ticket/ticket.aggregate';

export class PayBookingHandler {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly eventRepository: IEventRepository,
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(command: PayBookingCommand): Promise<void> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new Error(`Booking with id ${command.bookingId} not found`);
    }

    booking.pay(new Money(command.paymentAmount, command.currency));

    await this.bookingRepository.update(booking);

    const event = await this.eventRepository.findById(booking.eventId);
    if (!event) {
      throw new Error(`Event with id ${booking.eventId} not found`);
    }

    const quantity = booking.quantity.value;
    for (let i = 0; i < quantity; i++) {
      const ticket = Ticket.create({
        id: randomUUID(),
        bookingId: booking.id,
        eventId: booking.eventId,
        eventStartDate: event.dates.startDate,
      });
      await this.ticketRepository.save(ticket);
    }
  }
}