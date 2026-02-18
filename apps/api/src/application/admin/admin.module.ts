import {Module} from '@nestjs/common';
import {AdminSaga} from './admin.saga';
import * as command from './command';
import * as query from './query';

const providers = [AdminSaga, ...Object.values(command), ...Object.values(query)];

@Module({providers, exports: providers})
export class AdminModule {}
