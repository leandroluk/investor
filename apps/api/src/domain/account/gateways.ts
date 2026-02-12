import {type DocumentStatusEnum} from './enums';
import {type DocumentView} from './views';

export abstract class DocumentGateway {
  abstract findByStatus(
    status: DocumentStatusEnum,
    limit: number,
    offset: number
  ): Promise<{
    items: DocumentView[];
    total: number;
  }>;
}
