import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TicketCategoryOrmEntity } from './ticket-category.orm-entity';

@Entity('events')
export class EventOrmEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  organizerId!: string;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column()
  location!: string;

  @Column({ type: 'timestamp' })
  startDate!: Date;

  @Column({ type: 'timestamp' })
  endDate!: Date;

  @Column({ type: 'int' })
  capacity!: number;

  @Column()
  status!: string;

  @OneToMany(() => TicketCategoryOrmEntity, (tc) => tc.event, {
    cascade: true,
    eager: true,
  })
  ticketCategories!: TicketCategoryOrmEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}