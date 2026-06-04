import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('refunds')
export class RefundOrmEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  bookingId!: string;

  @Column()
  customerId!: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount!: number;

  @Column({ default: 'IDR' })
  currency!: string;

  @Column()
  status!: string;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ type: 'text', nullable: true })
  paymentReference!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}