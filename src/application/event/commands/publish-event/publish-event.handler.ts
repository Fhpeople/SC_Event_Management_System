import { PublishEventCommand } from './publish-event.command';
import { IEventRepository } from '../../../../domain/event/event.repository';

export class PublishEventHandler {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(command: PublishEventCommand): Promise<void> {
    const event = await this.eventRepository.findById(command.eventId);
    if (!event) {
      throw new Error(`Event with id ${command.eventId} not found`);
    }

    event.publish();

    await this.eventRepository.update(event);
  }
}