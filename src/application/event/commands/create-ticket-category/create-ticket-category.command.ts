export class CreateTicketCategoryCommand {
  constructor(
    public readonly eventId: string,
    public readonly name: string,
    public readonly price: number,
    public readonly currency: string,
    public readonly quota: number,
    public readonly salesStartDate: Date,
    public readonly salesEndDate: Date,
  ) {}
}