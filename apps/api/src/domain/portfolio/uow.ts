import {UOW} from '../_shared/classes';
import {type EarningRepository, type InvestmentRepository} from './repositories';

export abstract class PortfolioUOW extends UOW<{
  get investment(): InvestmentRepository;
  get earning(): EarningRepository;
}> {}
