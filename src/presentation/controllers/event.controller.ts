import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
} from '@nestjs/common';

import { CreateEventDto } from '../dtos/create-event.dto';
import { CreateTicketCategoryDto } from '../dtos/create-ticket-category.dto';

import { CreateEventHandler } from '../../application/event/commands/create-event/create-event.handler';
import { CreateEventCommand } from '../../application/event/commands/create-event/create-event.command';

import { PublishEventHandler } from '../../application/event/commands/publish-event/publish-event.handler';
import { PublishEventCommand } from '../../application/event/commands/publish-event/publish-event.command';

import { CancelEventHandler } from '../../application/event/commands/cancel-event/cancel-event.handler';
import { CancelEventCommand } from '../../application/event/commands/cancel-event/cancel-event.command';

import { CreateTicketCategoryHandler } from '../../application/event/commands/create-ticket-category/create-ticket-category.handler';
import { CreateTicketCategoryCommand } from '../../application/event/commands/create-ticket-category/create-ticket-category.command';

import { DisableTicketCategoryHandler } from '../../application/event/commands/disable-ticket-category/disable-ticket-category.handler';
import { DisableTicketCategoryCommand } from '../../application/event/commands/disable-ticket-category/disable-ticket-category.command';

import { GetAvailableEventsHandler, GetAvailableEventsQuery } from '../../application/event/queries/get-available-events/get-available-events.query';
import { GetEventDetailHandler, GetEventDetailQuery } from '../../application/event/queries/get-event-detail/get-event-detail.query';
import { GetParticipantListHandler, GetParticipantListQuery } from '../../application/event/queries/get-participant-list/get-participant-list.query';
import { GetSalesReportHandler, GetSalesReportQuery } from '../../application/event/queries/get-sales-report/get-sales-report.query';

@Controller('events')
export class EventController {
  constructor(
    private readonly createEventHandler: CreateEventHandler,
    private readonly publishEventHandler: PublishEventHandler,
    private readonly cancelEventHandler: CancelEventHandler,
    private readonly createTicketCategoryHandler: CreateTicketCategoryHandler,
    private readonly disableTicketCategoryHandler: DisableTicketCategoryHandler,
    private readonly getAvailableEventsHandler: GetAvailableEventsHandler,
    private readonly getEventDetailHandler: GetEventDetailHandler,
    private readonly getParticipantListHandler: GetParticipantListHandler,
    private readonly getSalesReportHandler: GetSalesReportHandler,
  ) {}

  @Post()
  async createEvent(@Body() dto: CreateEventDto): Promise<{ eventId: string }> {
    const command = new CreateEventCommand(
      dto.organizerId,
      dto.name,
      dto.description,
      dto.location,
      new Date(dto.startDate),
      new Date(dto.endDate),
      dto.capacity,
    );
    const eventId = await this.createEventHandler.execute(command);
    return { eventId };
  }

  @Post(':id/publish')
  async publishEvent(@Param('id') id: string): Promise<void> {
    const command = new PublishEventCommand(id);
    await this.publishEventHandler.execute(command);
  }

  @Post(':id/cancel')
  async cancelEvent(@Param('id') id: string): Promise<void> {
    const command = new CancelEventCommand(id);
    await this.cancelEventHandler.execute(command);
  }

  @Post(':id/ticket-categories')
  async createTicketCategory(
    @Param('id') id: string,
    @Body() dto: CreateTicketCategoryDto,
  ): Promise<{ ticketCategoryId: string }> {
    const command = new CreateTicketCategoryCommand(
      id,
      dto.name,
      dto.price,
      dto.currency,
      dto.quota,
      new Date(dto.salesStartDate),
      new Date(dto.salesEndDate),
    );
    const ticketCategoryId = await this.createTicketCategoryHandler.execute(command);
    return { ticketCategoryId };
  }

  @Patch(':id/ticket-categories/:categoryId/disable')
  async disableTicketCategory(
    @Param('id') id: string,
    @Param('categoryId') categoryId: string,
  ): Promise<void> {
    const command = new DisableTicketCategoryCommand(id, categoryId);
    await this.disableTicketCategoryHandler.execute(command);
  }

  @Get()
  async getAvailableEvents(
    @Query('date') date?: string,
    @Query('location') location?: string,
  ) {
    const query = new GetAvailableEventsQuery(
      date ? new Date(date) : undefined,
      location,
    );
    return this.getAvailableEventsHandler.execute(query);
  }

  @Get(':id')
  async getEventDetail(@Param('id') id: string) {
    const query = new GetEventDetailQuery(id);
    return this.getEventDetailHandler.execute(query);
  }

  @Get(':id/participants')
  async getParticipantList(@Param('id') id: string) {
    const query = new GetParticipantListQuery(id);
    return this.getParticipantListHandler.execute(query);
  }

  @Get(':id/sales-report')
  async getSalesReport(@Param('id') id: string) {
    const query = new GetSalesReportQuery(id);
    return this.getSalesReportHandler.execute(query);
  }
}