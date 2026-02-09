import {UploadDocumentCommand, UploadDocumentCommandResult} from '#/application/user/command';
import {PickType} from '@nestjs/swagger';

export class UploadDocumentBodyDTO extends PickType(UploadDocumentCommand, ['type', 'contentType', 'size']) {}

export class UploadDocumentResultDTO extends UploadDocumentCommandResult {}
