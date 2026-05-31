export class CreateTicketCategoryDto {
  eventId!: string;
  name!: string;
  price!: number;
  currency!: string;
  quota!: number;
  salesStartDate!: Date;
  salesEndDate!: Date;
}