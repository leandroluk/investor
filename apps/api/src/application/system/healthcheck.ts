// application/system/healthcheck.ts
import {Connectable} from '@/core/abstract';
import {injectAll, singleton} from '@/core/di';
import ms from 'ms';

export class HealthCheckResult {
  uptime!: string;
}

@singleton()
export class HealthCheckUseCase {
  constructor(@injectAll(Connectable) private connectableList: Connectable[]) {}

  async execute(): Promise<HealthCheckResult> {
    await Promise.all(this.connectableList.map(connectable => connectable.ping()));
    return {
      uptime: ms(process.uptime()),
    };
  }
}
