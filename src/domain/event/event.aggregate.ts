import { AggregateRoot } from '../shared/aggregate-root.base';
import { Money } from '../shared/money.value-object';
import { TicketCategory, TicketCategoryProps } from './ticket-category.entity';
import { EventStatus } from './event-status.enum';
import {
  EventName,
  EventDescription,
  EventLocation,
  EventDates,
  EventCapacity,
  SalesPeriod,
} from './event.value-objects';
import {
  CannotPublishEventError,
  CannotCancelEventError,
  QuotaExceedsCapacityError,
} from './event.errors';
import { EventCreatedEvent } from './events/event-created.event';
import { EventPublishedEvent } from './events/event-published.event';
import { EventCancelledEvent } from './events/event-cancelled.event';
import { TicketCategoryCreatedEvent } from './events/ticket-category-created.event';

export interface EventProps {
  organizerId: string;
  name: EventName;
  description: EventDescription;
  location: EventLocation;
  dates: EventDates;
  capacity: EventCapacity;
  status: EventStatus;
  ticketCategories: TicketCategory[];
}

export interface CreateEventProps {
  id: string;
  organizerId: string;
  name: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
}

export class Event extends AggregateRoot {
  private readonly _id: string;
  private props: EventProps;

  private constructor(id: string, props: EventProps) {
    super();
    this._id = id;
    this.props = props;
  }

  static create(createProps: CreateEventProps): Event {
    const event = new Event(createProps.id, {
      organizerId: createProps.organizerId,
      name: new EventName(createProps.name),
      description: new EventDescription(createProps.description),
      location: new EventLocation(createProps.location),
      dates: new EventDates(createProps.startDate, createProps.endDate),
      capacity: new EventCapacity(createProps.capacity),
      status: EventStatus.Draft,
      ticketCategories: [],
    });

    event.addDomainEvent(new EventCreatedEvent(event._id, createProps.organizerId));

    return event;
  }

  get id(): string {
    return this._id;
  }

  get organizerId(): string {
    return this.props.organizerId;
  }

  get name(): EventName {
    return this.props.name;
  }

  get description(): EventDescription {
    return this.props.description;
  }

  get location(): EventLocation {
    return this.props.location;
  }

  get dates(): EventDates {
    return this.props.dates;
  }

  get capacity(): EventCapacity {
    return this.props.capacity;
  }

  get status(): EventStatus {
    return this.props.status;
  }

  get ticketCategories(): TicketCategory[] {
    return this.props.ticketCategories;
  }

  addTicketCategory(
    id: string,
    name: string,
    price: Money,
    quota: number,
    salesStartDate: Date,
    salesEndDate: Date,
  ): void {
    const salesPeriod = new SalesPeriod(salesStartDate, salesEndDate, this.props.dates.startDate);

    const currentTotalQuota = this.props.ticketCategories.reduce(
      (sum, tc) => sum + tc.quota,
      0,
    );
    if (currentTotalQuota + quota > this.props.capacity.value) {
      throw new QuotaExceedsCapacityError();
    }

    const ticketCategory = new TicketCategory(id, {
      name,
      price,
      quota,
      remainingQuota: quota,
      salesPeriod,
      isActive: true,
    });

    this.props.ticketCategories.push(ticketCategory);

    this.addDomainEvent(new TicketCategoryCreatedEvent(id, this._id, name, quota, price));
  }

  publish(): void {
    if (this.props.status === EventStatus.Cancelled) {
      throw new CannotPublishEventError('event is cancelled');
    }
    if (this.props.status !== EventStatus.Draft) {
      throw new CannotPublishEventError('only draft events can be published');
    }

    const activeCategories = this.props.ticketCategories.filter((tc) => tc.isActive);
    if (activeCategories.length === 0) {
      throw new CannotPublishEventError('event must have at least one active ticket category');
    }

    const totalQuota = this.props.ticketCategories.reduce((sum, tc) => sum + tc.quota, 0);
    if (totalQuota > this.props.capacity.value) {
      throw new CannotPublishEventError('total ticket quota exceeds event capacity');
    }

    this.props.status = EventStatus.Published;

    this.addDomainEvent(new EventPublishedEvent(this._id, this.props.organizerId));
  }

  cancel(): void {
    if (this.props.status === EventStatus.Completed) {
      throw new CannotCancelEventError('completed events cannot be cancelled');
    }
    if (this.props.status !== EventStatus.Published) {
      throw new CannotCancelEventError('only published events can be cancelled');
    }

    this.props.status = EventStatus.Cancelled;

    this.addDomainEvent(new EventCancelledEvent(this._id, this.props.organizerId));
  }
}