import {HealthQueryResult} from '#/application/system/query';
import {createDTO} from '../../_shared/factories';

export class HealthResultDTO extends createDTO(HealthQueryResult) {}
