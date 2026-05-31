import { ApproveRefundCommand } from './approve-refund.command';
import { IRefundRepository } from '../../../../domain/refund/refund.repository';
import { IBookingRepository } from '../../../../domain/booking/booking.repository';
import { ITicketRepository } from '../../../../domain/ticket/ticket.repository';
import { BookingStatus } from '../../../../domain/booking/booking-status.enum';

export class ApproveRefundHandler {
  constructor(
    private readonly refundRepository: IRefundRepository,
    private readonly bookingRepository: IBookingRepository,
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(command: ApproveRefundCommand): Promise<void> {
    const refund = await this.refundRepository.findById(command.refundId);
    if (!refund) {
      throw new Error(`Refund with id ${command.refundId} not found`);
    }

    refund.approve();

    const tickets = await this.ticketRepository.findAllByBookingId(refund.bookingId);
    for (const ticket of tickets) {
      ticket.cancel();
      await this.ticketRepository.update(ticket);
    }

    const booking = await this.bookingRepository.findById(refund.bookingId);
    if (booking) {
      (booking as any).props.status = BookingStatus.Refunded;
      await this.bookingRepository.update(booking);
    }

    await this.refundRepository.update(refund);
  }
}