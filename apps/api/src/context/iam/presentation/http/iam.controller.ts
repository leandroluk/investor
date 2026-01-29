import {BaseController} from '#/core/presentation/http/controllers/base.controller';
import {Controller} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('iam')
@Controller('iam')
export class IamController extends BaseController {}
