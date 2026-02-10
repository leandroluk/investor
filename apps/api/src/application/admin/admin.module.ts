import {Module} from '@nestjs/common';
import * as command from './command';
import * as query from './query';

const providers = [...Object.values(command), ...Object.values(query)];

@Module({providers, exports: providers})
export class AdminModule {}
