import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ITicketRepository } from '../../domain/ticket/ticket.repository';
import { Ticket } from '../../domain/ticket/ticket.aggregate';
import { TicketOrmEntity } from '../database/orm-entities/ticket.orm-entity';
import { TicketStatus } from '../../domain/ticket/ticket-status.enum';
import { TicketCode, CheckInTime } from '../../domain/ticket/ticket.value-objects';


@Injectable()
export class TicketRepositoryImpl implements ITicketRepository {
  constructor(
    @InjectRepository(TicketOrmEntity)
    private readonly ticketRepo: Repository<TicketOrmEntity>,
  ) {}

  private toOrm(ticket: Ticket): TicketOrmEntity {
    const orm = new TicketOrmEntity();
    orm.id = ticket.id;
    orm.bookingId = ticket.bookingId;
    orm.eventId = ticket.eventId;
    orm.ticketCode = ticket.ticketCode.value;
    orm.status = ticket.status;
    orm.eventStartDate = ticket.eventStartDate;
    orm.checkedInAt = ticket.checkedInAt?.value ?? null;
    return orm;
  }

  private toDomain(orm: TicketOrmEntity): Ticket {
    return (Ticket as any).reconstruct(orm.id, {
      bookingId: orm.bookingId,
      eventId: orm.eventId,
      eventStartDate: orm.eventStartDate,
      ticketCode: new TicketCode(orm.ticketCode),
      status: orm.status as TicketStatus,
      checkedInAt: orm.checkedInAt ? new CheckInTime(orm.checkedInAt) : undefined,
    });
  }

  async save(ticket: Ticket): Promise<void> {
    const orm = this.toOrm(ticket);
    await this.ticketRepo.save(orm);
  }

  async update(ticket: Ticket): Promise<void> {
    const orm = this.toOrm(ticket);
    await this.ticketRepo.save(orm);
  }

  async findById(id: string): Promise<Ticket | null> {
    const orm = await this.ticketRepo.findOne({ where: { id } });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findByCode(ticketCode: string): Promise<Ticket | null> {
    const orm = await this.ticketRepo.findOne({ where: { ticketCode } });
    if (!orm) return null;
    return this.toDomain(orm);
  }

  async findAllByBookingId(bookingId: string): Promise<Ticket[]> {
    const orms = await this.ticketRepo.find({ where: { bookingId } });
    return orms.map((orm) => this.toDomain(orm));
  }
}