import {type NoticeEntity} from './entities';

export abstract class NoticeRepository {
  abstract create(entity: NoticeEntity): Promise<void>;
}
