import {RegisterDeviceCommand, RevokeDeviceCommand} from '#/application/account/command';
import {ListActiveDeviceQuery} from '#/application/account/query';
import {DeviceEntity} from '#/domain/account/entity';
import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {GetEnvelope, GetUser} from '../_shared/decorator';
import {AuthGuard} from '../_shared/guard';
import {RegisterDeviceBodyDTO} from './dto';

@ApiTags('device')
@Controller('device')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class DeviceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({description: 'Device registered successfully'})
  async postRegisterDevice(
    @GetEnvelope() envelope: GetEnvelope,
    @GetUser() user: GetUser,
    @Body() body: RegisterDeviceBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(new RegisterDeviceCommand({...envelope, userId: user.claims.subject, ...body}));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({summary: 'Revoke device'})
  @ApiNoContentResponse({description: 'Device revoked successfully'})
  async deleteRevokeDevice(
    @GetEnvelope() envelope: GetEnvelope,
    @GetUser() user: GetUser,
    @Param('id') id: string
  ): Promise<void> {
    await this.commandBus.execute(new RevokeDeviceCommand({...envelope, userId: user.claims.subject, id}));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'List active devices'})
  @ApiOkResponse({type: DeviceEntity, isArray: true})
  async getActiveDevices(
    @GetEnvelope() envelope: GetEnvelope, //
    @GetUser() user: GetUser
  ): Promise<DeviceEntity[]> {
    const result = await this.queryBus.execute(new ListActiveDeviceQuery({...envelope, userId: user.claims.subject}));
    return result;
  }
}
