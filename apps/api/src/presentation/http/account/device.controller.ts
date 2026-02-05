import {RegisterDeviceCommand, RevokeDeviceCommand} from '#/application/account/command';
import {ListActiveDeviceQuery} from '#/application/account/query';
import {AuthUnauthorizedError, DeviceNotFoundError, DeviceNotOwnedError} from '#/domain/account/error';
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
import {DomainException, GetEnvelope, GetUser} from '../_shared/decorator';
import {AuthGuard, ChallengeGuard} from '../_shared/guard';
import {ListActiveDeviceResultDTO, RegisterDeviceBodyDTO} from './dto';

@ApiTags('device')
@Controller('device')
@ApiBearerAuth()
@UseGuards(AuthGuard, ChallengeGuard)
@DomainException([AuthUnauthorizedError, HttpStatus.UNAUTHORIZED])
export class DeviceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // #region postRegisterDevice
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
  // #endregion

  // #region deleteRevokeDevice
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @DomainException([DeviceNotFoundError, HttpStatus.NOT_FOUND], [DeviceNotOwnedError, HttpStatus.FORBIDDEN])
  @ApiOperation({summary: 'Revoke device'})
  @ApiNoContentResponse({description: 'Device revoked successfully'})
  async deleteRevokeDevice(
    @GetEnvelope() envelope: GetEnvelope,
    @GetUser() user: GetUser,
    @Param('id') id: string
  ): Promise<void> {
    await this.commandBus.execute(new RevokeDeviceCommand({...envelope, userId: user.claims.subject, id}));
  }
  // #endregion

  // #region getListActiveDevice
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'List active devices'})
  @ApiOkResponse({type: ListActiveDeviceResultDTO})
  async getListActiveDevice(
    @GetEnvelope() envelope: GetEnvelope, //
    @GetUser() user: GetUser
  ): Promise<ListActiveDeviceResultDTO> {
    const result = await this.queryBus.execute(new ListActiveDeviceQuery({...envelope, userId: user.claims.subject}));
    return {items: result};
  }
  // #endregion
}
