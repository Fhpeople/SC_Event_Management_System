import { randomUUID } from 'crypto';
import { RequestRefundCommand } from './request-refund.command';
import { IBookingRepository } from '../../../../domain/booking/booking.repository';
import { ITicketRepository } from '../../../../domain/ticket/ticket.repository';
import { IRefundRepository } from '../../../../domain/refund/refund.repository';
import { Refund } from '../../../../domain/refund/refund.aggregate';
import { BookingStatus } from '../../../../domain/booking/booking-status.enum';
import { TicketStatus } from '../../../../domain/ticket/ticket-status.enum';
import { Money } from '../../../../domain/shared/money.value-object';

export class RequestRefundHandler {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly ticketRepository: ITicketRepository,
    private readonly refundRepository: IRefundRepository,
  ) {}

  async execute(command: RequestRefundCommand): Promise<string> {
    const booking = await this.bookingRepository.findById(command.bookingId);
    if (!booking) {
      throw new Error(`Booking with id ${command.bookingId} not found`);
    }

    if (booking.status !== BookingStatus.Paid) {
      throw new Error('Refund can only be requested for a Paid booking');
    }

    const tickets = await this.ticketRepository.findAllByBookingId(command.bookingId);
    const hasCheckedInTickets = tickets.some(
      (ticket) => ticket.status === TicketStatus.CheckedIn,
    );

    const refundId = randomUUID();
    const refund = Refund.create({
      id: refundId,
      bookingId: command.bookingId,
      customerId: command.customerId,
      amount: new Money(booking.totalPrice.amount, booking.totalPrice.currency),
      hasCheckedInTickets,
    });

    await this.refundRepository.save(refund);

    return refundId;
  }
}