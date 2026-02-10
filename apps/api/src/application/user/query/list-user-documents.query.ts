import {Query} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
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

export class ListUserDocumentResult extends createClass(
  z.object({
    items: z.array(
      DocumentEntity.schema.omit({
        storageKey: true,
      })
    ),
  })
) {}

@QueryHandler(ListUserDocumentQuery)
export class ListUserDocumentHandler implements IQueryHandler<ListUserDocumentQuery, ListUserDocumentResult> {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(query: ListUserDocumentQuery): Promise<ListUserDocumentResult> {
    return ListUserDocumentResult.new({items: await this.documentRepository.findByUserId(query.userId)});
  }
}
