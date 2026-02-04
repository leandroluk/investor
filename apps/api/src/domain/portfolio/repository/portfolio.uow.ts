import {DomainUOW} from '#/domain/_shared/uow';
import {type EarningRepository} from './earning.repository';
import {type InvestmentRepository} from './investiment.repository';

export abstract class PortfolioUOW extends DomainUOW<{
  get investment(): InvestmentRepository;
  get earning(): EarningRepository;
}> {}
