import { Event } from './event.aggregate';

export interface IEventRepository {
  save(event: Event): Promise<void>;

  update(event: Event): Promise<void>;

  findById(id: string): Promise<Event | null>;

  findAllPublished(): Promise<Event[]>;

  exists(id: string): Promise<boolean>;
}