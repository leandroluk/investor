import {ReviewDocumentCommand} from '#/application/admin/command';
import {createDTO} from '../../_shared/factories';

export class ReviewDocumentParamDTO extends createDTO(
  ReviewDocumentCommand.schema.pick({
    documentId: true,
  })
) {}

export class ReviewDocumentBodyDTO extends createDTO(
  ReviewDocumentCommand.schema.pick({
    status: true,
    rejectReason: true,
  })
) {}
