import { IEventRepository } from '../../../../domain/event/event.repository';
import { IBookingRepository } from '../../../../domain/booking/booking.repository';
import { BookingStatus } from '../../../../domain/booking/booking-status.enum';

export class GetSalesReportQuery {
  constructor(
    public readonly eventId: string,
  ) {}
}

export class TicketCategorySalesDto {
  ticketCategoryId!: string;
  name!: string;
  totalQuota!: number;
  ticketsSold!: number;
}

export class SalesReportDto {
  eventId!: string;
  eventName!: string;
  ticketCategorySales!: TicketCategorySalesDto[];
  totalBookings!: number;
  bookingsByStatus!: {
    pendingPayment: number;
    paid: number;
    expired: number;
    refunded: number;
  };
  totalRevenue!: number;
  currency!: string;
}

export class GetSalesReportHandler {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly bookingRepository: IBookingRepository,
  ) {}

  async execute(query: GetSalesReportQuery): Promise<SalesReportDto> {
    const event = await this.eventRepository.findById(query.eventId);
    if (!event) {
      throw new Error(`Event with id ${query.eventId} not found`);
    }

    const bookings = await this.bookingRepository.findAllByEventId(query.eventId);

    const bookingsByStatus = {
      pendingPayment: bookings.filter((b) => b.status === BookingStatus.PendingPayment).length,
      paid: bookings.filter((b) => b.status === BookingStatus.Paid).length,
      expired: bookings.filter((b) => b.status === BookingStatus.Expired).length,
      refunded: bookings.filter((b) => b.status === BookingStatus.Refunded).length,
    };

    const paidBookings = bookings.filter((b) => b.status === BookingStatus.Paid);
    const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalPrice.amount, 0);
    const currency = paidBookings[0]?.totalPrice.currency ?? 'IDR';

    const ticketCategorySales = event.ticketCategories.map((tc) => {
      const ticketsSold = tc.quota - tc.remainingQuota;
      const dto = new TicketCategorySalesDto();
      dto.ticketCategoryId = tc.getId();
      dto.name = tc.name;
      dto.totalQuota = tc.quota;
      dto.ticketsSold = ticketsSold;
      return dto;
    });

    const dto = new SalesReportDto();
    dto.eventId = event.id;
    dto.eventName = event.name.value;
    dto.ticketCategorySales = ticketCategorySales;
    dto.totalBookings = bookings.length;
    dto.bookingsByStatus = bookingsByStatus;
    dto.totalRevenue = totalRevenue;
    dto.currency = currency;
    return dto;
  }
}