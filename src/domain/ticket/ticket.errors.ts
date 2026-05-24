export class CannotCheckInTicketError extends Error {
  constructor(reason: string) {
    super(`Cannot check in ticket: ${reason}`);
    this.name = 'CannotCheckInTicketError';
  }
}

export class CannotCancelTicketError extends Error {
  constructor(reason: string) {
    super(`Cannot cancel ticket: ${reason}`);
    this.name = 'CannotCancelTicketError';
  }
}