export class RejectRefundCommand {
  constructor(
    public readonly refundId: string,
    public readonly reason: string,
  ) {}
}