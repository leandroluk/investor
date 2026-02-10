import {Module} from '@nestjs/common';
import * as command from './command';
import * as query from './query';
import {UserConfig} from './user.config';
import {UserSaga} from './user.saga';

const providers = [UserConfig, UserSaga, ...Object.values(command), ...Object.values(query)];

@Module({providers, exports: providers})
export class UserModule {}
