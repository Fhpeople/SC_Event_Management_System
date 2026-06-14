import {
  Controller,
  Post,
  Param,
  Body,
} from '@nestjs/common';

import { CreateBookingDto } from '../dtos/create-booking.dto';
import { PayBookingDto } from '../dtos/pay-booking.dto';

import { CreateBookingHandler } from '../../application/booking/commands/create-booking/create-booking.handler';
import { CreateBookingCommand } from '../../application/booking/commands/create-booking/create-booking.command';

import { PayBookingHandler } from '../../application/booking/commands/pay-booking/pay-booking.handler';
import { PayBookingCommand } from '../../application/booking/commands/pay-booking/pay-booking.command';

import { ExpireBookingHandler } from '../../application/booking/commands/expire-booking/expire-booking.handler';
import { ExpireBookingCommand } from '../../application/booking/commands/expire-booking/expire-booking.command';

@Controller('bookings')
export class BookingController {
  constructor(
    private readonly createBookingHandler: CreateBookingHandler,
    private readonly payBookingHandler: PayBookingHandler,
    private readonly expireBookingHandler: ExpireBookingHandler,
  ) {}

  @Post()
  async createBooking(
    @Body() dto: CreateBookingDto,
  ): Promise<{ bookingId: string }> {
    const command = new CreateBookingCommand(
      dto.customerId,
      dto.eventId,
      dto.ticketCategoryId,
      dto.quantity,
    );
    const bookingId = await this.createBookingHandler.execute(command);
    return { bookingId };
  }

  @Post(':id/pay')
  async payBooking(
    @Param('id') id: string,
    @Body() dto: PayBookingDto,
  ): Promise<void> {
    const command = new PayBookingCommand(id, dto.paymentAmount, dto.currency);
    await this.payBookingHandler.execute(command);
  }

  @Post(':id/expire')
  async expireBooking(@Param('id') id: string): Promise<void> {
    const command = new ExpireBookingCommand(id);
    await this.expireBookingHandler.execute(command);
  }
}