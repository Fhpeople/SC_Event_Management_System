import { Injectable } from '@nestjs/common';
import { INotificationService } from '../../application/ports/notification.interface';

@Injectable()
export class NotificationServiceImpl implements INotificationService {
  async sendBookingCreated(
    customerId: string,
    bookingId: string,
    eventName: string,
    totalPrice: number,
    paymentDeadline: Date,
  ): Promise<void> {
    console.log(
      `[Notification] Booking created — Customer: ${customerId}, Booking: ${bookingId}, Event: ${eventName}, Total: ${totalPrice}, Deadline: ${paymentDeadline}`,
    );
  }

  async sendBookingPaid(
    customerId: string,
    bookingId: string,
    eventName: string,
  ): Promise<void> {
    console.log(
      `[Notification] Booking paid — Customer: ${customerId}, Booking: ${bookingId}, Event: ${eventName}`,
    );
  }

  async sendBookingExpired(
    customerId: string,
    bookingId: string,
    eventName: string,
  ): Promise<void> {
    console.log(
      `[Notification] Booking expired — Customer: ${customerId}, Booking: ${bookingId}, Event: ${eventName}`,
    );
  }

  async sendEventCancelled(
    customerId: string,
    eventName: string,
    refundId: string,
  ): Promise<void> {
    console.log(
      `[Notification] Event cancelled — Customer: ${customerId}, Event: ${eventName}, Refund: ${refundId}`,
    );
  }

  async sendRefundApproved(
    customerId: string,
    refundId: string,
    amount: number,
    currency: string,
  ): Promise<void> {
    console.log(
      `[Notification] Refund approved — Customer: ${customerId}, Refund: ${refundId}, Amount: ${currency} ${amount}`,
    );
  }

  async sendRefundRejected(
    customerId: string,
    refundId: string,
    reason: string,
  ): Promise<void> {
    console.log(
      `[Notification] Refund rejected — Customer: ${customerId}, Refund: ${refundId}, Reason: ${reason}`,
    );
  }

  async sendRefundPaidOut(
    customerId: string,
    refundId: string,
    amount: number,
    currency: string,
    paymentReference: string,
  ): Promise<void> {
    console.log(
      `[Notification] Refund paid out — Customer: ${customerId}, Refund: ${refundId}, Amount: ${currency} ${amount}, Ref: ${paymentReference}`,
    );
  }
}