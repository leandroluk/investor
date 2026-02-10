import {RegisterDeviceCommand, RevokeDeviceCommand} from '#/application/device/command';
import {ListActiveDeviceQuery} from '#/application/device/query';
import {AuthUnauthorizedError, DeviceNotFoundError, DeviceNotOwnedError} from '#/domain/account/errors';
import {Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {GetMeta, MapDomainError} from '../_shared/decorators';
import {AuthGuard, ChallengeGuard} from '../_shared/guards';
import {ListActiveDeviceResultDTO, RegisterDeviceBodyDTO} from './dto';

@ApiTags('device')
@Controller('device')
@ApiBearerAuth()
@UseGuards(AuthGuard, ChallengeGuard)
@MapDomainError([AuthUnauthorizedError, HttpStatus.UNAUTHORIZED])
export class DeviceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // #region postRegisterDevice
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiHeader({name: 'x-fingerprint', required: true, example: 'fingerprint...'})
  @ApiCreatedResponse({description: 'Device registered successfully'})
  async postRegisterDevice(
    @GetMeta() meta: GetMeta, //
    @Body() body: RegisterDeviceBodyDTO
  ): Promise<void> {
    await this.commandBus.execute(RegisterDeviceCommand.new({...meta, ...body}));
  }
  // #endregion

  // #region deleteRevokeDevice
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @MapDomainError([DeviceNotFoundError, HttpStatus.NOT_FOUND], [DeviceNotOwnedError, HttpStatus.FORBIDDEN])
  @ApiOperation({summary: 'Revoke device'})
  @ApiNoContentResponse({description: 'Device revoked successfully'})
  async deleteRevokeDevice(
    @GetMeta() meta: GetMeta, //
    @Param('id') id: string
  ): Promise<void> {
    await this.commandBus.execute(RevokeDeviceCommand.new({...meta, id}));
  }
  // #endregion

  // #region getListActiveDevice
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'List active devices'})
  @ApiOkResponse({type: ListActiveDeviceResultDTO})
  async getListActiveDevice(
    @GetMeta() meta: GetMeta //
  ): Promise<ListActiveDeviceResultDTO> {
    const result = await this.queryBus.execute(ListActiveDeviceQuery.new({...meta}));
    return result;
  }
  // #endregion
}
