export class InvalidEventDatesError extends Error {
  constructor() {
    super('End date cannot be earlier than start date');
    this.name = 'InvalidEventDatesError';
  }
}

export class InvalidEventCapacityError extends Error {
  constructor() {
    super('Event capacity must be greater than zero');
    this.name = 'InvalidEventCapacityError';
  }
}

export class CannotPublishEventError extends Error {
  constructor(reason: string) {
    super(`Cannot publish event: ${reason}`);
    this.name = 'CannotPublishEventError';
  }
}

export class CannotCancelEventError extends Error {
  constructor(reason: string) {
    super(`Cannot cancel event: ${reason}`);
    this.name = 'CannotCancelEventError';
  }
}

export class QuotaExceedsCapacityError extends Error {
  constructor() {
    super('Total ticket quota exceeds event capacity');
    this.name = 'QuotaExceedsCapacityError';
  }
}

export class CannotDisableTicketCategoryError extends Error {
  constructor(reason: string) {
    super(`Cannot disable ticket category: ${reason}`);
    this.name = 'CannotDisableTicketCategoryError';
  }
}