import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventOrmEntity } from './infrastructure/database/orm-entities/event.orm-entity';
import { TicketCategoryOrmEntity } from './infrastructure/database/orm-entities/ticket-category.orm-entity';
import { BookingOrmEntity } from './infrastructure/database/orm-entities/booking.orm-entity';
import { TicketOrmEntity } from './infrastructure/database/orm-entities/ticket.orm-entity';
import { RefundOrmEntity } from './infrastructure/database/orm-entities/refund.orm-entity';

import { EventRepositoryImpl } from './infrastructure/repositories/event.repository.impl';
import { BookingRepositoryImpl } from './infrastructure/repositories/booking.repository.impl';
import { TicketRepositoryImpl } from './infrastructure/repositories/ticket.repository.impl';
import { RefundRepositoryImpl } from './infrastructure/repositories/refund.repository.impl';

import { PaymentGatewayImpl } from './infrastructure/services/payment-gateway.impl';
import { RefundPaymentServiceImpl } from './infrastructure/services/refund-payment.impl';
import { NotificationServiceImpl } from './infrastructure/services/notification.impl';

import { CreateEventHandler } from './application/event/commands/create-event/create-event.handler';
import { PublishEventHandler } from './application/event/commands/publish-event/publish-event.handler';
import { CancelEventHandler } from './application/event/commands/cancel-event/cancel-event.handler';
import { CreateTicketCategoryHandler } from './application/event/commands/create-ticket-category/create-ticket-category.handler';
import { DisableTicketCategoryHandler } from './application/event/commands/disable-ticket-category/disable-ticket-category.handler';
import { CreateBookingHandler } from './application/booking/commands/create-booking/create-booking.handler';
import { PayBookingHandler } from './application/booking/commands/pay-booking/pay-booking.handler';
import { ExpireBookingHandler } from './application/booking/commands/expire-booking/expire-booking.handler';
import { CheckInTicketHandler } from './application/ticket/commands/check-in-ticket/check-in-ticket.handler';
import { RequestRefundHandler } from './application/refund/commands/request-refund/request-refund.handler';
import { ApproveRefundHandler } from './application/refund/commands/approve-refund/approve-refund.handler';
import { RejectRefundHandler } from './application/refund/commands/reject-refund/reject-refund.handler';
import { MarkRefundPaidOutHandler } from './application/refund/commands/mark-refund-paid-out/mark-refund-paid-out.handler';

import { GetAvailableEventsHandler } from './application/event/queries/get-available-events/get-available-events.query';
import { GetEventDetailHandler } from './application/event/queries/get-event-detail/get-event-detail.query';
import { GetSalesReportHandler } from './application/event/queries/get-sales-report/get-sales-report.query';
import { GetParticipantListHandler } from './application/event/queries/get-participant-list/get-participant-list.query';
import { GetCustomerTicketsHandler } from './application/ticket/queries/get-customer-tickets/get-customer-tickets.query';

import { EventController } from './presentation/controllers/event.controller';
import { BookingController } from './presentation/controllers/booking.controller';

@Module({
  controllers: [EventController, BookingController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'event_management'),
        entities: [
          EventOrmEntity,
          TicketCategoryOrmEntity,
          BookingOrmEntity,
          TicketOrmEntity,
          RefundOrmEntity,
        ],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),

    TypeOrmModule.forFeature([
      EventOrmEntity,
      TicketCategoryOrmEntity,
      BookingOrmEntity,
      TicketOrmEntity,
      RefundOrmEntity,
    ]),
  ],

  providers: [
    EventRepositoryImpl,
    BookingRepositoryImpl,
    TicketRepositoryImpl,
    RefundRepositoryImpl,

    PaymentGatewayImpl,
    RefundPaymentServiceImpl,
    NotificationServiceImpl,

    {
      provide: CreateEventHandler,
      useFactory: (repo: EventRepositoryImpl) =>
        new CreateEventHandler(repo),
      inject: [EventRepositoryImpl],
    },
    {
      provide: PublishEventHandler,
      useFactory: (repo: EventRepositoryImpl) =>
        new PublishEventHandler(repo),
      inject: [EventRepositoryImpl],
    },
    {
      provide: CancelEventHandler,
      useFactory: (repo: EventRepositoryImpl) =>
        new CancelEventHandler(repo),
      inject: [EventRepositoryImpl],
    },
    {
      provide: CreateTicketCategoryHandler,
      useFactory: (repo: EventRepositoryImpl) =>
        new CreateTicketCategoryHandler(repo),
      inject: [EventRepositoryImpl],
    },
    {
      provide: DisableTicketCategoryHandler,
      useFactory: (repo: EventRepositoryImpl) =>
        new DisableTicketCategoryHandler(repo),
      inject: [EventRepositoryImpl],
    },
    {
      provide: CreateBookingHandler,
      useFactory: (
        eventRepo: EventRepositoryImpl,
        bookingRepo: BookingRepositoryImpl,
      ) => new CreateBookingHandler(eventRepo, bookingRepo),
      inject: [EventRepositoryImpl, BookingRepositoryImpl],
    },
    {
      provide: PayBookingHandler,
      useFactory: (repo: BookingRepositoryImpl) =>
        new PayBookingHandler(repo),
      inject: [BookingRepositoryImpl],
    },
    {
      provide: ExpireBookingHandler,
      useFactory: (
        bookingRepo: BookingRepositoryImpl,
        eventRepo: EventRepositoryImpl,
      ) => new ExpireBookingHandler(bookingRepo, eventRepo),
      inject: [BookingRepositoryImpl, EventRepositoryImpl],
    },
    {
      provide: CheckInTicketHandler,
      useFactory: (repo: TicketRepositoryImpl) =>
        new CheckInTicketHandler(repo),
      inject: [TicketRepositoryImpl],
    },
    {
      provide: RequestRefundHandler,
      useFactory: (
        bookingRepo: BookingRepositoryImpl,
        ticketRepo: TicketRepositoryImpl,
        refundRepo: RefundRepositoryImpl,
      ) => new RequestRefundHandler(bookingRepo, ticketRepo, refundRepo),
      inject: [BookingRepositoryImpl, TicketRepositoryImpl, RefundRepositoryImpl],
    },
    {
      provide: ApproveRefundHandler,
      useFactory: (
        refundRepo: RefundRepositoryImpl,
        bookingRepo: BookingRepositoryImpl,
        ticketRepo: TicketRepositoryImpl,
      ) => new ApproveRefundHandler(refundRepo, bookingRepo, ticketRepo),
      inject: [RefundRepositoryImpl, BookingRepositoryImpl, TicketRepositoryImpl],
    },
    {
      provide: RejectRefundHandler,
      useFactory: (repo: RefundRepositoryImpl) =>
        new RejectRefundHandler(repo),
      inject: [RefundRepositoryImpl],
    },
    {
      provide: MarkRefundPaidOutHandler,
      useFactory: (repo: RefundRepositoryImpl) =>
        new MarkRefundPaidOutHandler(repo),
      inject: [RefundRepositoryImpl],
    },

    {
      provide: GetAvailableEventsHandler,
      useFactory: (repo: EventRepositoryImpl) =>
        new GetAvailableEventsHandler(repo),
      inject: [EventRepositoryImpl],
    },
    {
      provide: GetEventDetailHandler,
      useFactory: (repo: EventRepositoryImpl) =>
        new GetEventDetailHandler(repo),
      inject: [EventRepositoryImpl],
    },
    {
      provide: GetSalesReportHandler,
      useFactory: (
        eventRepo: EventRepositoryImpl,
        bookingRepo: BookingRepositoryImpl,
      ) => new GetSalesReportHandler(eventRepo, bookingRepo),
      inject: [EventRepositoryImpl, BookingRepositoryImpl],
    },
    {
      provide: GetParticipantListHandler,
      useFactory: (
        bookingRepo: BookingRepositoryImpl,
        ticketRepo: TicketRepositoryImpl,
      ) => new GetParticipantListHandler(bookingRepo, ticketRepo),
      inject: [BookingRepositoryImpl, TicketRepositoryImpl],
    },
    {
      provide: GetCustomerTicketsHandler,
      useFactory: (repo: TicketRepositoryImpl) =>
        new GetCustomerTicketsHandler(repo),
      inject: [TicketRepositoryImpl],
    },
  ],
})
export class AppModule {}