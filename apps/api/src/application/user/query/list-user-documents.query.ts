import {Query} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {StoragePort} from '#/domain/_shared/ports';
import {DocumentEntity, UserEntity} from '#/domain/account/entities';
import {DocumentRepository} from '#/domain/account/repositories';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import z from 'zod';

export class ListUserDocumentQuery extends createClass(
  Query,
  z.object({
    userId: UserEntity.schema.shape.id,
  })
) {}

export class ListUserDocumentResultItem extends createClass(DocumentEntity.schema) {
  url!: string;
}

export class ListUserDocumentResult {
  readonly items!: ListUserDocumentResultItem[];
}

@QueryHandler(ListUserDocumentQuery)
export class ListUserDocumentHandler implements IQueryHandler<ListUserDocumentQuery, ListUserDocumentResult> {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly storagePort: StoragePort
  ) {}

  async execute(query: ListUserDocumentQuery): Promise<ListUserDocumentResult> {
    const documents = await this.documentRepository.findByUserId(query.userId);

    const items = await Promise.all(
      documents.map(async doc => {
        const url = await this.storagePort.getSignedUrl(doc.storageKey, 15 * 60, 'read');
        return {...doc, url};
      })
    );

    return {items};
  }
}
