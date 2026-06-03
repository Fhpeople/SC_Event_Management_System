import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IRefundRepository } from '../../domain/refund/refund.repository';
import { Refund } from '../../domain/refund/refund.aggregate';
import { RefundOrmEntity } from '../database/orm-entities/refund.orm-entity';
import { RefundStatus } from '../../domain/refund/refund-status.enum';
import { Money } from '../../domain/shared/money.value-object';
import { RefundReason, PaymentReference } from '../../domain/refund/refund.value-objects';

@Injectable()
export class RefundRepositoryImpl implements IRefundRepository {
  constructor(
    @InjectRepository(RefundOrmEntity)
    private readonly refundRepo: Repository<RefundOrmEntity>,
  ) {}

  private toOrm(refund: Refund): RefundOrmEntity {
    const orm = new RefundOrmEntity();
    orm.id = refund.id;
    orm.bookingId = refund.bookingId;
    orm.customerId = refund.customerId;
    orm.amount = refund.amount.amount;
    orm.currency = refund.amount.currency;
    orm.status = refund.status;
    orm.reason = refund.reason?.value ?? null;
    orm.paymentReference = refund.paymentReference?.value ?? null;
    return orm;
  }

  private toDomain(orm: RefundOrmEntity): Refund {
    return (Refund as any).reconstruct(orm.id, {
      bookingId: orm.bookingId,
      customerId: orm.customerId,
      amount: new Money(Number(orm.amount), orm.currency),
      status: orm.status as RefundStatus,
      reason: orm.reason ? new RefundReason(orm.reason) : undefined,
      paymentReference: orm.paymentReference
        ? new PaymentReference(orm.paymentReference)
        : undefined,
      hasCheckedInTickets: false,
    });
  }

  async save(refund: Refund): Promise<void> {
    const orm = this.toOrm(refund);
    await this.refundRepo.save(orm);
  }

  async update(refund: Refund): Promise<void> {
    const orm = this.toOrm(refund);
    await this.refundRepo.save(orm);
  }

  async findById(id: string): Promise<Refund | null> {
    const orm = await this.refundRepo.findOne({ where: { id } });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findByBookingId(bookingId: string): Promise<Refund | null> {
    const orm = await this.refundRepo.findOne({ where: { bookingId } });
    if (!orm) return null;
    return this.toDomain(orm);
  }
}