export class CannotCreateBookingError extends Error {
  constructor(reason: string) {
    super(`Cannot create booking: ${reason}`);
    this.name = 'CannotCreateBookingError';
  }
}

export class BookingPaymentError extends Error {
  constructor(reason: string) {
    super(`Cannot pay booking: ${reason}`);
    this.name = 'BookingPaymentError';
  }
}

export class BookingExpireError extends Error {
  constructor(reason: string) {
    super(`Cannot expire booking: ${reason}`);
    this.name = 'BookingExpireError';
  }
}