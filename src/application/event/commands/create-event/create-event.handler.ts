import { randomUUID } from 'crypto';
import { CreateEventCommand } from './create-event.command';
import { IEventRepository } from '../../../../domain/event/event.repository';
import { Event } from '../../../../domain/event/event.aggregate';

export class CreateEventHandler {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(command: CreateEventCommand): Promise<string> {
    const eventId = randomUUID();
    const event = Event.create({
      id: eventId,
      organizerId: command.organizerId,
      name: command.name,
      description: command.description,
      location: command.location,
      startDate: command.startDate,
      endDate: command.endDate,
      capacity: command.capacity,
    });

    await this.eventRepository.save(event);

    return eventId;
  }
}