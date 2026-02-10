import {Module} from '@nestjs/common';
import * as query from './query';

const providers = Object.values(query);

@Module({providers, exports: providers})
export class SystemModule {}
