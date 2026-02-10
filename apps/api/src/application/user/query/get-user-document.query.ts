import {Query} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {StoragePort} from '#/domain/_shared/ports';
import {DocumentEntity, UserEntity} from '#/domain/account/entities';
import {DocumentNotFoundError} from '#/domain/account/errors';
import {DocumentRepository} from '#/domain/account/repositories';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import z from 'zod';

export class GetUserDocumentQuery extends createClass(
  Query,
  z.object({
    userId: UserEntity.schema.shape.id,
    documentId: DocumentEntity.schema.shape.id,
  })
) {}

@QueryHandler(GetUserDocumentQuery)
export class GetUserDocumentHandler implements IQueryHandler<GetUserDocumentQuery, string> {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly storagePort: StoragePort
  ) {}

  async execute(query: GetUserDocumentQuery): Promise<string> {
    const documents = await this.documentRepository.findByUserId(query.userId);

    const document = documents.find(doc => doc.id === query.documentId);

    if (!document) {
      throw new DocumentNotFoundError(query.documentId);
    }

    return await this.storagePort.getSignedURL(document.storageKey, 15 * 60, 'read');
  }
}
