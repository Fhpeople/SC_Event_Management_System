import { Refund } from './refund.aggregate';

export interface IRefundRepository {
  save(refund: Refund): Promise<void>;

  update(refund: Refund): Promise<void>;

  findById(id: string): Promise<Refund | null>;

  findByBookingId(bookingId: string): Promise<Refund | null>;
}