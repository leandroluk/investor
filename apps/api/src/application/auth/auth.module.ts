import {Module} from '@nestjs/common';
import {AuthConfig} from './auth.config';
import {AuthSaga} from './auth.saga';
import * as command from './command';
import * as query from './query';

const providers = [AuthConfig, AuthSaga, ...Object.values(command), ...Object.values(query)];

@Module({providers, exports: providers})
export class AuthModule {}
