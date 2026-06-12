import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IEventRepository } from '../../domain/event/event.repository';
import { Event } from '../../domain/event/event.aggregate';
import { EventOrmEntity } from '../database/orm-entities/event.orm-entity';
import { TicketCategoryOrmEntity } from '../database/orm-entities/ticket-category.orm-entity';
import { EventStatus } from '../../domain/event/event-status.enum';
import { EventName, EventDescription, EventLocation, EventDates, EventCapacity, SalesPeriod } from '../../domain/event/event.value-objects';
import { TicketCategory } from '../../domain/event/ticket-category.entity';
import { Money } from '../../domain/shared/money.value-object';

@Injectable()
export class EventRepositoryImpl implements IEventRepository {
  constructor(
    @InjectRepository(EventOrmEntity)
    private readonly eventRepo: Repository<EventOrmEntity>,
  ) {}

  private toOrm(event: Event): EventOrmEntity {
    const orm = new EventOrmEntity();
    orm.id = event.id;
    orm.organizerId = event.organizerId;
    orm.name = event.name.value;
    orm.description = event.description.value;
    orm.location = event.location.value;
    orm.startDate = event.dates.startDate;
    orm.endDate = event.dates.endDate;
    orm.capacity = event.capacity.value;
    orm.status = event.status;
    orm.ticketCategories = event.ticketCategories.map((tc) => {
      const tcOrm = new TicketCategoryOrmEntity();
      tcOrm.id = tc.getId();
      tcOrm.eventId = event.id;
      tcOrm.name = tc.name;
      tcOrm.price = tc.price.amount;
      tcOrm.currency = tc.price.currency;
      tcOrm.quota = tc.quota;
      tcOrm.remainingQuota = tc.remainingQuota;
      tcOrm.salesStartDate = tc.salesPeriod.salesStartDate;
      tcOrm.salesEndDate = tc.salesPeriod.salesEndDate;
      tcOrm.isActive = tc.isActive;
      return tcOrm;
    });
    return orm;
  }

  private toDomain(orm: EventOrmEntity): Event {
    const ticketCategories = (orm.ticketCategories ?? []).map((tcOrm) => {
      return new TicketCategory(tcOrm.id, {
        name: tcOrm.name,
        price: new Money(Number(tcOrm.price), tcOrm.currency),
        quota: Number(tcOrm.quota),  
        remainingQuota: Number(tcOrm.remainingQuota),
        salesPeriod: new SalesPeriod(new Date(tcOrm.salesStartDate), new Date(tcOrm.salesEndDate)),
        isActive: tcOrm.isActive,
      });
    });

    return (Event as any).reconstruct(orm.id, {
      organizerId: orm.organizerId,
      name: new EventName(orm.name),
      description: new EventDescription(orm.description),
      location: new EventLocation(orm.location),
      dates: new EventDates(new Date(orm.startDate), new Date(orm.endDate)),
      capacity: new EventCapacity(Number(orm.capacity)),
      status: orm.status as EventStatus,
      ticketCategories,
    });
  }

  async save(event: Event): Promise<void> {
    const orm = this.toOrm(event);
    await this.eventRepo.save(orm);
  }

  async update(event: Event): Promise<void> {
    const orm = this.toOrm(event);
    await this.eventRepo.save(orm);
  }

  async findById(id: string): Promise<Event | null> {
    const orm = await this.eventRepo.findOne({ where: { id } });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findAllPublished(): Promise<Event[]> {
    const orms = await this.eventRepo.find({
      where: { status: EventStatus.Published },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.eventRepo.count({ where: { id } });
    return count > 0;
  }
}