import {Injectable, OnApplicationBootstrap} from '@nestjs/common';
import {TemplateMustacheAdapter} from './mustache.adapter';

@Injectable()
export class TemplateMustacheLifecycle implements OnApplicationBootstrap {
  constructor(private readonly templateMustacheAdapter: TemplateMustacheAdapter) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.templateMustacheAdapter.load();
  }
}
