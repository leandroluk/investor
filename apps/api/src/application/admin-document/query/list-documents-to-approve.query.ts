import {Query} from '#/application/_shared/bus';
import {DocumentStatusEnum} from '#/domain/account/enum';
import {DocumentRepository} from '#/domain/account/repository';
import {DocumentView} from '#/domain/account/view';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import z from 'zod';

const querySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  status: z.enum(DocumentStatusEnum).default(DocumentStatusEnum.PENDING),
});

type QuerySchema = z.infer<typeof querySchema>;

export class ListDocumentsToApproveQuery extends Query<QuerySchema> {
  readonly page!: number;
  readonly limit!: number;
  readonly status!: DocumentStatusEnum;

  constructor(payload: Partial<QuerySchema>) {
    super(payload as any, querySchema);
  }
}

export class ListDocumentsToApproveResult {
  readonly items!: DocumentView[];
  readonly total!: number;
  readonly page!: number;
  readonly limit!: number;
}

@QueryHandler(ListDocumentsToApproveQuery)
export class ListDocumentsToApproveHandler implements IQueryHandler<
  ListDocumentsToApproveQuery,
  ListDocumentsToApproveResult
> {
  constructor(private readonly documentRepository: DocumentRepository) {}

  async execute(query: ListDocumentsToApproveQuery): Promise<ListDocumentsToApproveResult> {
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
