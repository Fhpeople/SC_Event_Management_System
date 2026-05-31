export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

export interface IPaymentGateway {
  processPayment(
    bookingId: string,
    amount: number,
    currency: string,
  ): Promise<PaymentResult>;
}