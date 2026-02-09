import {ListDocumentToApproveQuery, ListDocumentToApproveResult} from '#/application/admin/query';
import {createDTO} from '../../_shared/factories';

export class ListDocumentToApproveQueryDTO extends createDTO(
  ListDocumentToApproveQuery.schema.pick({
    page: true,
    limit: true,
    status: true,
  })
) {}

export class ListDocumentToApproveResultDTO extends createDTO(ListDocumentToApproveResult) {}
