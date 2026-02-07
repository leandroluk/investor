import {Module} from '@nestjs/common';
import * as command from './command';
import * as query from './query';
import * as saga from './saga';

const providers = Array().concat(Object.values(command), Object.values(query), Object.values(saga));

@Module({providers, exports: providers})
export class AuthModule {}
