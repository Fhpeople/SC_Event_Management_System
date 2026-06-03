import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBookingRepository } from '../../domain/booking/booking.repository';
import { Booking } from '../../domain/booking/booking.aggregate';
import { BookingOrmEntity } from '../database/orm-entities/booking.orm-entity';
import { BookingStatus } from '../../domain/booking/booking-status.enum';
import { Money } from '../../domain/shared/money.value-object';
import { TicketQuantity, PaymentDeadline } from '../../domain/booking/booking.value-objects';

@Injectable()
export class BookingRepositoryImpl implements IBookingRepository {
  constructor(
    @InjectRepository(BookingOrmEntity)
    private readonly bookingRepo: Repository<BookingOrmEntity>,
  ) {}

  private toOrm(booking: Booking): BookingOrmEntity {
    const orm = new BookingOrmEntity();
    orm.id = booking.id;
    orm.customerId = booking.customerId;
    orm.eventId = booking.eventId;
    orm.ticketCategoryId = booking.ticketCategoryId;
    orm.quantity = booking.quantity.value;
    orm.unitPrice = booking.unitPrice.amount;
    orm.totalPrice = booking.totalPrice.amount;
    orm.currency = booking.totalPrice.currency;
    orm.status = booking.status;
    orm.paymentDeadline = booking.paymentDeadline.value;
    return orm;
  }

  private toDomain(orm: BookingOrmEntity): Booking {
    return (Booking as any).reconstruct(orm.id, {
      customerId: orm.customerId,
      eventId: orm.eventId,
      ticketCategoryId: orm.ticketCategoryId,
      quantity: new TicketQuantity(orm.quantity),
      unitPrice: new Money(Number(orm.unitPrice), orm.currency),
      totalPrice: new Money(Number(orm.totalPrice), orm.currency),
      status: orm.status as BookingStatus,
      paymentDeadline: new PaymentDeadline(orm.paymentDeadline),
    });
  }


  async save(booking: Booking): Promise<void> {
    const orm = this.toOrm(booking);
    await this.bookingRepo.save(orm);
  }

  async update(booking: Booking): Promise<void> {
    const orm = this.toOrm(booking);
    await this.bookingRepo.save(orm);
  }

  async findById(id: string): Promise<Booking | null> {
    const orm = await this.bookingRepo.findOne({ where: { id } });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findActiveByCustomerAndEvent(
    customerId: string,
    eventId: string,
  ): Promise<Booking | null> {
    const orm = await this.bookingRepo.findOne({
      where: {
        customerId,
        eventId,
        status: BookingStatus.PendingPayment,
      },
    });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findAllExpired(): Promise<Booking[]> {
    const orms = await this.bookingRepo.find({
      where: { status: BookingStatus.Expired },
    });
    return orms.map((orm) => this.toDomain(orm));
  }

  async findAllByEventId(eventId: string): Promise<Booking[]> {
    const orms = await this.bookingRepo.find({ where: { eventId } });
    return orms.map((orm) => this.toDomain(orm));
  }
}