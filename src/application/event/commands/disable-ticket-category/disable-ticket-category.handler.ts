import { DisableTicketCategoryCommand } from './disable-ticket-category.command';
import { IEventRepository } from '../../../../domain/event/event.repository';

export class DisableTicketCategoryHandler {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(command: DisableTicketCategoryCommand): Promise<void> {
    const event = await this.eventRepository.findById(command.eventId);
    if (!event) {
      throw new Error(`Event with id ${command.eventId} not found`);
    }

    event.disableTicketCategory(command.ticketCategoryId);

    await this.eventRepository.update(event);
  }
}