import {
  Controller,
  Post,
  Param,
  Body,
} from '@nestjs/common';

import { RequestRefundDto } from '../dtos/request-refund.dto';

import { RequestRefundHandler } from '../../application/refund/commands/request-refund/request-refund.handler';
import { RequestRefundCommand } from '../../application/refund/commands/request-refund/request-refund.command';

import { ApproveRefundHandler } from '../../application/refund/commands/approve-refund/approve-refund.handler';
import { ApproveRefundCommand } from '../../application/refund/commands/approve-refund/approve-refund.command';

import { RejectRefundHandler } from '../../application/refund/commands/reject-refund/reject-refund.handler';
import { RejectRefundCommand } from '../../application/refund/commands/reject-refund/reject-refund.command';

import { MarkRefundPaidOutHandler } from '../../application/refund/commands/mark-refund-paid-out/mark-refund-paid-out.handler';
import { MarkRefundPaidOutCommand } from '../../application/refund/commands/mark-refund-paid-out/mark-refund-paid-out.command';

@Controller('refunds')
export class RefundController {
  constructor(
    private readonly requestRefundHandler: RequestRefundHandler,
    private readonly approveRefundHandler: ApproveRefundHandler,
    private readonly rejectRefundHandler: RejectRefundHandler,
    private readonly markRefundPaidOutHandler: MarkRefundPaidOutHandler,
  ) {}

  @Post()
  async requestRefund(
    @Body() dto: RequestRefundDto,
  ): Promise<{ refundId: string }> {
    const command = new RequestRefundCommand(dto.bookingId, dto.customerId);
    const refundId = await this.requestRefundHandler.execute(command);
    return { refundId };
  }

  @Post(':id/approve')
  async approveRefund(@Param('id') id: string): Promise<void> {
    const command = new ApproveRefundCommand(id);
    await this.approveRefundHandler.execute(command);
  }

  @Post(':id/reject')
  async rejectRefund(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ): Promise<void> {
    const command = new RejectRefundCommand(id, body.reason);
    await this.rejectRefundHandler.execute(command);
  }

  @Post(':id/mark-paid-out')
  async markPaidOut(
    @Param('id') id: string,
    @Body() body: { paymentReference: string },
  ): Promise<void> {
    const command = new MarkRefundPaidOutCommand(id, body.paymentReference);
    await this.markRefundPaidOutHandler.execute(command);
  }
}