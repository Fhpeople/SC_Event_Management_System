export class CreateEventCommand {
  constructor(
    public readonly organizerId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly location: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly capacity: number,
  ) {}
}