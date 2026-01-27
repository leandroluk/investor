// presentation/http/controller/system/controller.ts
import {HealthCheckResult, HealthCheckUseCase} from '@/application';
import {container, singleton} from '@/core/di';
import {Controller, Get} from '@/presentation/http/decorator';

@singleton()
@Controller('/', ['System'])
export class SystemController {
  constructor() {}

  @Get('/health', {
    summary: 'Health Check',
    description: 'Checks connectivity of all infrastructure adapters',
    responses: {
      200: {description: 'System is healthy'},
      500: {description: 'System is unhealthy'},
    },
  })
  async health(): Promise<HealthCheckResult> {
    const usecase = await container.resolve(HealthCheckUseCase);
    return await usecase.execute();
  }
}
