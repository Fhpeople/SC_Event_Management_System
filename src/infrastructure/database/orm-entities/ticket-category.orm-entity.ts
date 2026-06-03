import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventOrmEntity } from './event.orm-entity';

@Entity('ticket_categories')
export class TicketCategoryOrmEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  eventId!: string;

  @Column()
  name!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price!: number;

  @Column({ default: 'IDR' })
  currency!: string;

  @Column({ type: 'int' })
  quota!: number;

  @Column({ type: 'int' })
  remainingQuota!: number;

  @Column({ type: 'timestamp' })
  salesStartDate!: Date;

  @Column({ type: 'timestamp' })
  salesEndDate!: Date;

  @Column({ default: true })
  isActive!: boolean;

  @ManyToOne(() => EventOrmEntity, (event) => event.ticketCategories)
  @JoinColumn({ name: 'eventId' })
  event!: EventOrmEntity;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}