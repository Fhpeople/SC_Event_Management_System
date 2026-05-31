import { ITicketRepository } from '../../../../domain/ticket/ticket.repository';
import { TicketStatus } from '../../../../domain/ticket/ticket-status.enum';

export class GetCustomerTicketsQuery {
  constructor(
    public readonly customerId: string,
    public readonly bookingId: string,
  ) {}
}

export class CustomerTicketDto {
  ticketId!: string;
  ticketCode!: string;
  eventId!: string;
  bookingId!: string;
  status!: TicketStatus;
  checkedInAt?: Date;
}

export class GetCustomerTicketsHandler {
  constructor(
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(query: GetCustomerTicketsQuery): Promise<CustomerTicketDto[]> {
    const tickets = await this.ticketRepository.findAllByBookingId(query.bookingId);

    return tickets.map((ticket) => {
      const dto = new CustomerTicketDto();
      dto.ticketId = ticket.id;
      dto.ticketCode = ticket.ticketCode.value;
      dto.eventId = ticket.eventId;
      dto.bookingId = ticket.bookingId;
      dto.status = ticket.status;
      dto.checkedInAt = ticket.checkedInAt?.value;
      return dto;
    });
  }
}