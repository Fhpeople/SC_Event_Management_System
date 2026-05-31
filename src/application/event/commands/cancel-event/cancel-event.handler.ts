import { CancelEventCommand } from './cancel-event.command';
import { IEventRepository } from '../../../../domain/event/event.repository';

export class CancelEventHandler {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(command: CancelEventCommand): Promise<void> {
    const event = await this.eventRepository.findById(command.eventId);
    if (!event) {
      throw new Error(`Event with id ${command.eventId} not found`);
    }

    event.cancel();

    await this.eventRepository.update(event);
  }
}