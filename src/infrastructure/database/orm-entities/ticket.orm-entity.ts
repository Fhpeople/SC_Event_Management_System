import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tickets')
export class TicketOrmEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  bookingId!: string;

  @Column()
  eventId!: string;

  @Column({ type: 'timestamp' })
  eventStartDate!: Date;

  @Column({ unique: true })
  ticketCode!: string;

  @Column()
  status!: string;

  @Column({ type: 'timestamp', nullable: true })
  checkedInAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}