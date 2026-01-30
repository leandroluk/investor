import {UnitOfWork} from '../_shared/unit-of-work';
import {type EarningRepository, type InvestmentRepository} from './repository';

export abstract class PortfolioUnitOfWork extends UnitOfWork<{
  get investment(): InvestmentRepository;
  get earning(): EarningRepository;
}> {}
