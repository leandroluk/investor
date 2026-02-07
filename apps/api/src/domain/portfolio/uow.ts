import {DomainUOW} from '#/domain/_shared/uow';
import {type EarningRepository, type InvestmentRepository} from './repository';

export abstract class PortfolioUOW extends DomainUOW<{
  get investment(): InvestmentRepository;
  get earning(): EarningRepository;
}> {}
