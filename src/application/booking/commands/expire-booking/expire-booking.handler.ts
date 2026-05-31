import { ExpireBookingCommand } from './expire-booking.command';
import { IEventRepository } from '../../../../domain/event/event.repository';
import { IBookingRepository } from '../../../../domain/booking/booking.repository';

export class ExpireBookingHandler {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly eventRepository: IEventRepository,
  ) {}

  async execute(command: ExpireBookingCommand): Promise<void> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new Error(`Booking with id ${command.bookingId} not found`);
    }

    booking.expire();

    const event = await this.eventRepository.findById(booking.eventId);
    if (event) {
      const ticketCategory = event.ticketCategories.find(
        (tc) => tc.getId() === booking.ticketCategoryId,
      );
      if (ticketCategory) {
        ticketCategory.releaseQuota(booking.quantity.value);
        await this.eventRepository.update(event);
      }
    }

    await this.bookingRepository.update(booking);
  }
}