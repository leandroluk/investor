import {GetUserProfileQueryResult} from '#/application/user/query';
import {createDTO} from '../../_shared/factories';

export class GetUserProfileResultDTO extends createDTO(GetUserProfileQueryResult) {}
