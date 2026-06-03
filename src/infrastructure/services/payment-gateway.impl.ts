import { Injectable } from '@nestjs/common';
import {
  IPaymentGateway,
  PaymentResult,
} from '../../application/ports/payment-gateway.interface';

@Injectable()
export class PaymentGatewayImpl implements IPaymentGateway {
  async processPayment(
    bookingId: string,
    amount: number,
    currency: string,
  ): Promise<PaymentResult> {
    console.log(
      `[PaymentGateway] Processing payment for booking ${bookingId}: ${currency} ${amount}`,
    );

    return {
      success: true,
      transactionId: `TXN-${bookingId}-${Date.now()}`,
      message: 'Payment processed successfully',
    };
  }
}