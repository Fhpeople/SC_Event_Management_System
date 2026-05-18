import { Event } from './event.aggregate';
import { IEventRepository } from './event.repository';

export class EventDomainService {
  constructor(private readonly eventRepository: IEventRepository) {}

  async validateEventCanBePublished(eventId: string): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new Error(`Event with id ${eventId} not found`);
    }

    event.publish();

    return event;
  }

  async validateTotalQuota(eventId: string, additionalQuota: number): Promise<void> {
    const event = await this.eventRepository.findById(eventId);

    if (!event) {
      throw new Error(`Event with id ${eventId} not found`);
    }

    const currentTotalQuota = event.ticketCategories.reduce(
      (sum, tc) => sum + tc.quota,
      0,
    );

    if (currentTotalQuota + additionalQuota > event.capacity.value) {
      throw new Error(
        `Total quota (${currentTotalQuota + additionalQuota}) exceeds event capacity (${event.capacity.value})`,
      );
    }
  }
}