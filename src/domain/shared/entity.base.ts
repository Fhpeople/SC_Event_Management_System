export abstract class Entity<TId> {
  constructor(protected readonly id: TId) {}

  public getId(): TId {
    return this.id;
  }

  public equals(other: Entity<TId>): boolean {
    if (!(other instanceof Entity)) return false;
    return this.id === other.id;
  }
}