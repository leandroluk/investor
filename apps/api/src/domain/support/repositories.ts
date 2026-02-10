import {type TicketEntity} from './entities';

export abstract class TicketRepository {
  abstract create(entity: TicketEntity): Promise<void>;
}
