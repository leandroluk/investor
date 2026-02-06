import {UpdateUserProfileCommand} from '#/application/account/command';
import {GetUserProfileQuery} from '#/application/account/query';
import {AuthUnauthorizedError, UserNotFoundError} from '#/domain/account/error';
import {Body, Controller, Get, HttpCode, HttpStatus, Patch, UseGuards} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ApiBearerAuth, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {GetMeta, GetUserId, MapDomainError} from '../_shared/decorator';
import {AuthGuard, ChallengeGuard} from '../_shared/guard';
import {GetUserProfileResultDTO, UpdateUserProfileBodyDTO} from './dto';

@ApiTags('profile')
@Controller('profile')
@ApiBearerAuth()
@UseGuards(AuthGuard, ChallengeGuard)
@MapDomainError([AuthUnauthorizedError, HttpStatus.UNAUTHORIZED])
export class ProfileController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // #region patchUpdateUserProfile
  @Patch()
  @HttpCode(HttpStatus.OK)
  @MapDomainError([UserNotFoundError, HttpStatus.NOT_FOUND])
  @ApiOkResponse({description: 'User profile updated successfully.', type: GetUserProfileResultDTO})
  async patchUpdateUserProfile(
    @GetMeta() meta: GetMeta,
    @GetUserId() userId: GetUserId,
    @Body() body: UpdateUserProfileBodyDTO
  ): Promise<GetUserProfileResultDTO> {
    await this.commandBus.execute(new UpdateUserProfileCommand({...meta, ...body, userId}));
    const result = await this.queryBus.execute(new GetUserProfileQuery({...meta, userId}));
    return result;
  }
  // #endregion

  // #region getGetUserProfile
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({description: 'Get user profile.', type: GetUserProfileResultDTO})
  async getGetUserProfile(
    @GetMeta() meta: GetMeta, //
    @GetUserId() userId: GetUserId
  ): Promise<GetUserProfileResultDTO> {
    const result = await this.queryBus.execute(new GetUserProfileQuery({...meta, userId}));
    return result;
  }
  // #endregion
}
