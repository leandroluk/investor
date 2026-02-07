import {Query} from '#/application/_shared/bus';
import {StoragePort} from '#/domain/_shared/port';
import {DocumentEntity} from '#/domain/account/entity';
import {DocumentRepository} from '#/domain/account/repository';
import {IQueryHandler, QueryHandler} from '@nestjs/cqrs';
import z from 'zod';

const querySchema = z.object({
  userId: z.uuid(),
});

type QuerySchema = z.infer<typeof querySchema>;

export class ListUserDocumentsQuery extends Query<QuerySchema> {
  readonly userId!: string;

  constructor(payload: QuerySchema) {
    super(payload as any, querySchema);
  }
}

export class ListUserDocumentsResultItem extends DocumentEntity {
  url!: string;
}

export class ListUserDocumentsResult {
  readonly items!: ListUserDocumentsResultItem[];
}

@QueryHandler(ListUserDocumentsQuery)
export class ListUserDocumentsHandler implements IQueryHandler<ListUserDocumentsQuery, ListUserDocumentsResult> {
  constructor(
    private readonly documentRepository: DocumentRepository,
    private readonly storagePort: StoragePort
  ) {}

  async execute(query: ListUserDocumentsQuery): Promise<ListUserDocumentsResult> {
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
