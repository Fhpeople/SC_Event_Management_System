export class CreateEventDto {
  organizerId!: string;
  name!: string;
  description!: string;
  location!: string;
  startDate!: Date;
  endDate!: Date;
  capacity!: number;
}