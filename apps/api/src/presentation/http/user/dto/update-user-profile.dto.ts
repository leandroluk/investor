import {UpdateUserProfileCommand} from '#/application/user/command';
import {createDTO} from '../../_shared/factories';

export class UpdateUserProfileBodyDTO extends createDTO(UpdateUserProfileCommand.schema.shape.changes) {}
