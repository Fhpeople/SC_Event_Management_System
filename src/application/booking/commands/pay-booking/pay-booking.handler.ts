import { PayBookingCommand } from './pay-booking.command';
import { IBookingRepository } from '../../../../domain/booking/booking.repository';
import { Money } from '../../../../domain/shared/money.value-object';

export class PayBookingHandler {
  constructor(
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(command: PayBookingCommand): Promise<void> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new Error(`Booking with id ${command.bookingId} not found`);
    }

    booking.pay(new Money(command.paymentAmount, command.currency));

    await this.bookingRepository.update(booking);
  }
}