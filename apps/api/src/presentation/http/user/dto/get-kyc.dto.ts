import {GetKycQueryResult} from '#/application/user/query';
import {createDTO} from '../../_shared/factories';

export class GetKycResultDTO extends createDTO(GetKycQueryResult) {}
