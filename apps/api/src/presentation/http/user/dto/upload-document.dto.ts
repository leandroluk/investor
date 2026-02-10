import {UploadDocumentCommand, UploadDocumentCommandResult} from '#/application/user/command';
import {createDTO} from '../../_shared/factories';

export class UploadDocumentBodyDTO extends createDTO(
  UploadDocumentCommand.schema.pick({
    type: true,
    contentType: true,
    size: true,
  })
) {}

export class UploadDocumentResultDTO extends createDTO(UploadDocumentCommandResult) {}
