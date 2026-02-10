import {GetUserDocumentQuery} from '#/application/user/query';
import {createDTO} from '../../_shared/factories';

export class GetUserDocumentParamDTO extends createDTO(
  GetUserDocumentQuery.schema.pick({
    documentId: true,
  })
) {}
