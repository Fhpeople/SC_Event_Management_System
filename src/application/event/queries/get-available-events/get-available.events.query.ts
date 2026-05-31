import { IEventRepository } from '../../../../domain/event/event.repository';

export class GetAvailableEventsQuery {
  constructor(
    public readonly filterDate?: Date,
    public readonly filterLocation?: string,
  ) {}
}

export class AvailableEventDto {
  id!: string;
  name!: string;
  startDate!: Date;
  endDate!: Date;
  location!: string;
  lowestPrice!: number;
  currency!: string;
}

export class GetAvailableEventsHandler {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(query: GetAvailableEventsQuery): Promise<AvailableEventDto[]> {
    let events = await this.eventRepository.findAllPublished();

    if (query.filterDate) {
      events = events.filter(
        (event) =>
          event.dates.startDate >= query.filterDate! ||
          event.dates.endDate >= query.filterDate!,
      );
    }

    if (query.filterLocation) {
      events = events.filter((event) =>
        event.location.value
          .toLowerCase()
          .includes(query.filterLocation!.toLowerCase()),
      );
    }

    return events.map((event) => {
      const activeCategories = event.ticketCategories.filter((tc) => tc.isActive);
      const lowestPrice =
        activeCategories.length > 0
          ? Math.min(...activeCategories.map((tc) => tc.price.amount))
          : 0;

      const dto = new AvailableEventDto();
      dto.id = event.id;
      dto.name = event.name.value;
      dto.startDate = event.dates.startDate;
      dto.endDate = event.dates.endDate;
      dto.location = event.location.value;
      dto.lowestPrice = lowestPrice;
      dto.currency = activeCategories[0]?.price.currency ?? 'IDR';
      return dto;
    });
  }
}