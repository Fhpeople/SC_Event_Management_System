import { MarkRefundPaidOutCommand } from './mark-refund-paid-out.command';
import { IRefundRepository } from '../../../../domain/refund/refund.repository';

export class MarkRefundPaidOutHandler {
  constructor(
    private readonly refundRepository: IRefundRepository,
  ) {}

  async execute(command: MarkRefundPaidOutCommand): Promise<void> {
    const refund = await this.refundRepository.findById(command.refundId);
    if (!refund) {
      throw new Error(`Refund with id ${command.refundId} not found`);
    }

    refund.markAsPaidOut(command.paymentReference);

    await this.refundRepository.update(refund);
  }
}