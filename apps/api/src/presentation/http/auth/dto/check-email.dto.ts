import {CheckEmailQuery} from '#/application/auth/query';
import {createDTO} from '../../_shared/factories';

export class CheckEmailParamDTO extends createDTO(CheckEmailQuery) {}
