export interface RefundResult {
  success: boolean;
  paymentReference: string;
  message: string;
}

export interface IRefundPaymentService {
  processRefund(
    refundId: string,
    customerId: string,
    amount: number,
    currency: string,
  ): Promise<RefundResult>;
}