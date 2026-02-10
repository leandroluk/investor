import {CheckEmailQuery} from '#/application/auth/query';
import {createDTO} from '../../_shared/factories';

export class CheckEmailParamsDTO extends createDTO(CheckEmailQuery) {}
