import { IEventRepository } from '../../../../domain/event/event.repository';

export class GetEventDetailQuery {
  constructor(public readonly eventId: string) {}
}

export enum TicketCategoryDisplayStatus {
  Available = 'Available',
  ComingSoon = 'Coming Soon',
  SalesClosed = 'Sales Closed',
  SoldOut = 'Sold Out',
}

export class TicketCategoryDetailDto {
  id!: string;
  name!: string;
  price!: number;
  currency!: string;
  quota!: number;
  remainingQuota!: number;
  displayStatus!: TicketCategoryDisplayStatus;
}

export class EventDetailDto {
  id!: string;
  name!: string;
  description!: string;
  startDate!: Date;
  endDate!: Date;
  location!: string;
  organizerId!: string;
  ticketCategories!: TicketCategoryDetailDto[];
}

export class GetEventDetailHandler {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(query: GetEventDetailQuery): Promise<EventDetailDto> {
    const event = await this.eventRepository.findById(query.eventId);
    if (!event) {
      throw new Error(`Event with id ${query.eventId} not found`);
    }

    const ticketCategoryDtos = event.ticketCategories
      .filter((tc) => tc.isActive)
      .map((tc) => {
        let displayStatus: TicketCategoryDisplayStatus;

        if (tc.isSoldOut()) {
          displayStatus = TicketCategoryDisplayStatus.SoldOut;
        } else if (tc.salesPeriod.hasNotStarted()) {
          displayStatus = TicketCategoryDisplayStatus.ComingSoon;
        } else if (tc.salesPeriod.hasEnded()) {
          displayStatus = TicketCategoryDisplayStatus.SalesClosed;
        } else {
          displayStatus = TicketCategoryDisplayStatus.Available;
        }

        const dto = new TicketCategoryDetailDto();
        dto.id = tc.getId();
        dto.name = tc.name;
        dto.price = tc.price.amount;
        dto.currency = tc.price.currency;
        dto.quota = tc.quota;
        dto.remainingQuota = tc.remainingQuota;
        dto.displayStatus = displayStatus;
        return dto;
      });

    const dto = new EventDetailDto();
    dto.id = event.id;
    dto.name = event.name.value;
    dto.description = event.description.value;
    dto.startDate = event.dates.startDate;
    dto.endDate = event.dates.endDate;
    dto.location = event.location.value;
    dto.organizerId = event.organizerId;
    dto.ticketCategories = ticketCategoryDtos;
    return dto;
  }
}