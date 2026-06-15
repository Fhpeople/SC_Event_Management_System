import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';

import { CheckInTicketDto } from '../dtos/check-in-ticket.dto';

import { CheckInTicketHandler } from '../../application/ticket/commands/check-in-ticket/check-in-ticket.handler';
import { CheckInTicketCommand } from '../../application/ticket/commands/check-in-ticket/check-in-ticket.command';

import { GetCustomerTicketsHandler, GetCustomerTicketsQuery } from '../../application/ticket/queries/get-customer-tickets/get-customer-tickets.query';

@Controller('tickets')
export class TicketController {
  constructor(
    private readonly checkInTicketHandler: CheckInTicketHandler,
    private readonly getCustomerTicketsHandler: GetCustomerTicketsHandler,
  ) {}

  @Post('check-in')
  async checkIn(@Body() dto: CheckInTicketDto): Promise<void> {
    const command = new CheckInTicketCommand(dto.ticketCode, dto.eventId);
    await this.checkInTicketHandler.execute(command);
  }

  @Get()
  async getCustomerTickets(
    @Query('customerId') customerId: string,
    @Query('bookingId') bookingId: string,
  ) {
    const query = new GetCustomerTicketsQuery(customerId, bookingId);
    return this.getCustomerTicketsHandler.execute(query);
  }
}