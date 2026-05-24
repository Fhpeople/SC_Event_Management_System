export class CannotRequestRefundError extends Error {
  constructor(reason: string) {
    super(`Cannot request refund: ${reason}`);
    this.name = 'CannotRequestRefundError';
  }
}

export class CannotApproveRefundError extends Error {
  constructor(reason: string) {
    super(`Cannot approve refund: ${reason}`);
    this.name = 'CannotApproveRefundError';
  }
}

export class CannotRejectRefundError extends Error {
  constructor(reason: string) {
    super(`Cannot reject refund: ${reason}`);
    this.name = 'CannotRejectRefundError';
  }
}

export class CannotMarkRefundAsPaidOutError extends Error {
  constructor(reason: string) {
    super(`Cannot mark refund as paid out: ${reason}`);
    this.name = 'CannotMarkRefundAsPaidOutError';
  }
}