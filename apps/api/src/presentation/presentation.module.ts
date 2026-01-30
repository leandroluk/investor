import {Module} from '@nestjs/common';
import {HttpModule} from './http/http.module';

const modules = [HttpModule];

@Module({imports: modules, exports: modules})
export class PresentationModule {}
