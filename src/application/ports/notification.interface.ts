export interface INotificationService {
  sendBookingCreated(
    customerId: string,
    bookingId: string,
    eventName: string,
    totalPrice: number,
    paymentDeadline: Date,
  ): Promise<void>;

  sendBookingPaid(
    customerId: string,
    bookingId: string,
    eventName: string,
  ): Promise<void>;

  sendBookingExpired(
    customerId: string,
    bookingId: string,
    eventName: string,
  ): Promise<void>;

  sendEventCancelled(
    customerId: string,
    eventName: string,
    refundId: string,
  ): Promise<void>;

  sendRefundApproved(
    customerId: string,
    refundId: string,
    amount: number,
    currency: string,
  ): Promise<void>;

  sendRefundRejected(
    customerId: string,
    refundId: string,
    reason: string,
  ): Promise<void>;

  sendRefundPaidOut(
    customerId: string,
    refundId: string,
    amount: number,
    currency: string,
    paymentReference: string,
  ): Promise<void>;
}