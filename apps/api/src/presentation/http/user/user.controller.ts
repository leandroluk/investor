import {UpdateUserProfileCommand, UploadDocumentCommand} from '#/application/user/command';
import {GetUserProfileQuery, ListUserDocumentQuery, ListUserDocumentResult} from '#/application/user/query';
import {AuthUnauthorizedError, UserNotFoundError} from '#/domain/account/errors';
import {Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, UseGuards} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {GetMeta, MapDomainError} from '../_shared/decorators';
import {AuthGuard, ChallengeGuard} from '../_shared/guards';
import {GetUserProfileResultDTO, UpdateUserProfileBodyDTO, UploadDocumentBodyDTO, UploadDocumentResultDTO} from './dto';

@ApiTags('user')
@Controller('user')
@ApiBearerAuth()
@UseGuards(AuthGuard, ChallengeGuard)
@MapDomainError([AuthUnauthorizedError, HttpStatus.UNAUTHORIZED])
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // #region postUploadDocument
  @Post('document')
  @ApiCreatedResponse({type: UploadDocumentResultDTO})
  async postUploadDocument(
    @Body() body: UploadDocumentBodyDTO,
    @GetMeta() meta: GetMeta
  ): Promise<UploadDocumentResultDTO> {
    const result = await this.commandBus.execute(new UploadDocumentCommand({...meta, ...body, type: body.type as any}));
    return result;
  }
  // #endregion

  // #region getListUserDocument
  @Get('document')
  @ApiOkResponse({type: ListUserDocumentResult})
  async getListUserDocument(
    @GetMeta() meta: GetMeta //
  ): Promise<ListUserDocumentResult> {
    return await this.queryBus.execute(new ListUserDocumentQuery({...meta}));
  }
  // #endregion

  // #region patchUpdateUserProfile
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @MapDomainError([UserNotFoundError, HttpStatus.NOT_FOUND])
  @ApiOkResponse({description: 'User profile updated successfully.', type: GetUserProfileResultDTO})
  async patchUpdateUserProfile(
    @GetMeta() meta: GetMeta, //
    @Body() body: UpdateUserProfileBodyDTO
  ): Promise<GetUserProfileResultDTO> {
    const result = await this.commandBus.execute(new UpdateUserProfileCommand({...meta, ...body}));
    return result;
  }
  // #endregion

  // #region getGetUserProfile
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({description: 'Get user profile.', type: GetUserProfileResultDTO})
  async getGetUserProfile(
    @GetMeta() meta: GetMeta //
  ): Promise<GetUserProfileResultDTO> {
    const result = await this.queryBus.execute(new GetUserProfileQuery({...meta}));
    return result;
  }
  // #endregion
}
