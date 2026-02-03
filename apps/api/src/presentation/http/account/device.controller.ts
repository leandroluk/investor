import {RegisterDeviceCommand} from '#/application/account/command/register-device.command';
import {Body, Controller, HttpCode, HttpStatus, Post, UseGuards} from '@nestjs/common';
import {CommandBus} from '@nestjs/cqrs';
import {ApiBearerAuth, ApiCreatedResponse, ApiTags} from '@nestjs/swagger';
import {GetEnvelope, GetUser} from '../_shared/decorator';
import {AuthGuard} from '../_shared/guard';
import {RegisterDeviceBodyDTO} from './dto';

@ApiTags('device')
@Controller('device')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class DeviceController {
  constructor(private readonly commandBus: CommandBus) {}

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
}
