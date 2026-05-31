import { CheckInTicketCommand } from './check-in-ticket.command';
import { ITicketRepository } from '../../../../domain/ticket/ticket.repository';

export class CheckInTicketHandler {
  constructor(
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(command: CheckInTicketCommand): Promise<void> {
    const ticket = await this.ticketRepository.findByCode(command.ticketCode);
    if (!ticket) {
      throw new Error('Ticket is invalid — ticket code not found');
    }

    ticket.checkIn(command.eventId, new Date());

    await this.ticketRepository.update(ticket);
  }
}