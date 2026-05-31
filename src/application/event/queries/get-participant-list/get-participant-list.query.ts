import { IBookingRepository } from '../../../../domain/booking/booking.repository';
import { ITicketRepository } from '../../../../domain/ticket/ticket.repository';
import { BookingStatus } from '../../../../domain/booking/booking-status.enum';
import { TicketStatus } from '../../../../domain/ticket/ticket-status.enum';

export class GetParticipantListQuery {
  constructor(
    public readonly eventId: string,
  ) {}
}

export class ParticipantDto {
  customerId!: string;
  ticketCategoryId!: string;
  ticketCategoryName!: string;
  ticketCode!: string;
  checkInStatus!: TicketStatus;
  checkedInAt?: Date;
}

export class GetParticipantListHandler {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(query: GetParticipantListQuery): Promise<ParticipantDto[]> {
    const bookings = await this.bookingRepository.findAllByEventId(query.eventId);
    const paidBookings = bookings.filter(
      (b) => b.status === BookingStatus.Paid,
    );

    const participants: ParticipantDto[] = [];

    for (const booking of paidBookings) {
      const tickets = await this.ticketRepository.findAllByBookingId(booking.id);

      for (const ticket of tickets) {
        if (ticket.status === TicketStatus.Cancelled) continue;

        const dto = new ParticipantDto();
        dto.customerId = booking.customerId;
        dto.ticketCategoryId = booking.ticketCategoryId;
        dto.ticketCategoryName = booking.ticketCategoryId;
        dto.ticketCode = ticket.ticketCode.value;
        dto.checkInStatus = ticket.status;
        dto.checkedInAt = ticket.checkedInAt?.value;
        participants.push(dto);
      }
    }

    return participants;
  }
}