import { Injectable } from '@nestjs/common';
import {
  IRefundPaymentService,
  RefundResult,
} from '../../application/ports/refund-payment.interface';

@Injectable()
export class RefundPaymentServiceImpl implements IRefundPaymentService {
  async processRefund(
    refundId: string,
    customerId: string,
    amount: number,
    currency: string,
  ): Promise<RefundResult> {
    console.log(
      `[RefundPaymentService] Processing refund ${refundId} for customer ${customerId}: ${currency} ${amount}`,
    );

    return {
      success: true,
      paymentReference: `REF-${refundId}-${Date.now()}`,
      message: 'Refund processed successfully',
    };
  }
}