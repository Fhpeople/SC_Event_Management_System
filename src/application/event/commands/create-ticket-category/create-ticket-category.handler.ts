import { randomUUID } from 'crypto';
import { CreateTicketCategoryCommand } from './create-ticket-category.command';
import { IEventRepository } from '../../../../domain/event/event.repository';
import { Money } from '../../../../domain/shared/money.value-object';

export class CreateTicketCategoryHandler {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(command: CreateTicketCategoryCommand): Promise<string> {
    const event = await this.eventRepository.findById(command.eventId);
    if (!event) {
      throw new Error(`Event with id ${command.eventId} not found`);
    }

    const ticketCategoryId = randomUUID();

    event.addTicketCategory(
      ticketCategoryId,
      command.name,
      new Money(command.price, command.currency),
      command.quota,
      command.salesStartDate,
      command.salesEndDate,
    );

    await this.eventRepository.update(event);

    return ticketCategoryId;
  }
}