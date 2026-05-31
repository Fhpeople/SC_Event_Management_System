import { RejectRefundCommand } from './reject-refund.command';
import { IRefundRepository } from '../../../../domain/refund/refund.repository';

export class RejectRefundHandler {
  constructor(
    private readonly refundRepository: IRefundRepository,
  ) {}

  async execute(command: RejectRefundCommand): Promise<void> {
    const refund = await this.refundRepository.findById(command.refundId);
    if (!refund) {
      throw new Error(`Refund with id ${command.refundId} not found`);
    }

    refund.reject(command.reason);

    await this.refundRepository.update(refund);
  }
}