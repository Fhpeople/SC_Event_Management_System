import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bookings')
export class BookingOrmEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  customerId!: string;

  @Column()
  eventId!: string;

  @Column()
  ticketCategoryId!: string;

  @Column({ type: 'int' })
  quantity!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  unitPrice!: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalPrice!: number;

  @Column({ default: 'IDR' })
  currency!: string;

  @Column()
  status!: string;

  @Column({ type: 'timestamp' })
  paymentDeadline!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}