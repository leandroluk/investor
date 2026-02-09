import {Query} from '#/application/_shared/bus';
import {createClass} from '#/domain/_shared/factories';
import {DocumentStatusEnum} from '#/domain/account/enums';
import {DocumentRepository} from '#/domain/account/repositories';
import {DocumentView} from '#/domain/account/views';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import z from 'zod';

export class ListDocumentToApproveQuery extends createClass(
  Query,
  z.object({
    page: z.number().int().positive().default(1).meta({
      description: 'Page number',
      example: 1,
    }),
    limit: z.number().int().positive().max(100).default(20).meta({
      description: 'Limit per page',
      example: 20,
    }),
    status: z.enum(DocumentStatusEnum).default(DocumentStatusEnum.PENDING).meta({
      description: 'Document status',
      example: DocumentStatusEnum.PENDING,
    }),
  })
) {}

export class ListDocumentToApproveResult extends createClass(
  z.object({
    items: z.array(DocumentView.schema).meta({
      description: 'List of documents',
    }),
    total: z.number().meta({
      description: 'Total number of documents',
      example: 100,
    }),
    page: z.number().meta({
      description: 'Current page',
      example: 1,
    }),
    limit: z.number().meta({
      description: 'Limit per page',
      example: 20,
    }),
  })
) {}

@QueryHandler(ListDocumentToApproveQuery)
export class ListDocumentToApproveHandler implements IQueryHandler<
  ListDocumentToApproveQuery,
  ListDocumentToApproveResult
> {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(query: ListDocumentToApproveQuery): Promise<ListDocumentToApproveResult> {
    const offset = (query.page - 1) * query.limit;
    const {items, total} = await this.documentRepository.findByStatus(query.status, query.limit, offset);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
    };
  }
}
