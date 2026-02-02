import {Injectable, OnApplicationBootstrap} from '@nestjs/common';
import {TemplateMustacheAdapter} from './mustache.adapter';

@Injectable()
export class TemplateMustacheLifecycle implements OnApplicationBootstrap {
  constructor(private readonly adapter: TemplateMustacheAdapter) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.adapter.load();
  }
}
