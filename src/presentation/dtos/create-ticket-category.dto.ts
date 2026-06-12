export class CreateTicketCategoryDto {
  name!: string;
  price!: number;
  currency!: string;
  quota!: number;
  salesStartDate!: Date;
  salesEndDate!: Date;
}