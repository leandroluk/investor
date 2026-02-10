import {RequestWalletNonceCommand, UpdateUserProfileCommand, UploadDocumentCommand} from '#/application/user/command';
import {GetUserProfileQuery, ListUserDocumentQuery, ListUserDocumentResult} from '#/application/user/query';
import {AuthUnauthorizedError, UserNotFoundError} from '#/domain/account/errors';
import {Body, Controller, Get, HttpCode, HttpStatus, Post, Put, UseGuards} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags} from '@nestjs/swagger';
import {GetMeta, MapDomainError} from '../_shared/decorators';
import {AuthGuard, ChallengeGuard} from '../_shared/guards';
import {
  GetUserProfileResultDTO,
  RequestWalletNonceResultDTO,
  UpdateUserProfileBodyDTO,
  UploadDocumentBodyDTO,
  UploadDocumentResultDTO,
} from './dto';

@ApiTags('user')
@Controller('user')
@ApiBearerAuth()
@UseGuards(AuthGuard, ChallengeGuard)
@MapDomainError([AuthUnauthorizedError, HttpStatus.UNAUTHORIZED], [UserNotFoundError, HttpStatus.NOT_FOUND])
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // #region postRequestWalletNonce
  @Post('wallet/nonce')
  @ApiCreatedResponse({type: RequestWalletNonceResultDTO})
  async postRequestWalletNonce(@GetMeta() meta: GetMeta): Promise<RequestWalletNonceResultDTO> {
    const result = await this.commandBus.execute(RequestWalletNonceCommand.new({...meta}));
    return result;
  }
  // #endregion

  // #region postUploadDocument
  @Post('document')
  @ApiCreatedResponse({type: UploadDocumentResultDTO})
  async postUploadDocument(
    @Body() body: UploadDocumentBodyDTO,
    @GetMeta() meta: GetMeta
  ): Promise<UploadDocumentResultDTO> {
    const result = await this.commandBus.execute(UploadDocumentCommand.new({...meta, ...body}));
    return result;
  }
  // #endregion

  // #region getListUserDocument
  @Get('document')
  @ApiOkResponse({type: ListUserDocumentResult})
  async getListUserDocument(
    @GetMeta() meta: GetMeta //
  ): Promise<ListUserDocumentResult> {
    return await this.queryBus.execute(ListUserDocumentQuery.new({...meta}));
  }
  // #endregion

  // #region putUpdateUserProfile
  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({description: 'User profile updated successfully.', type: GetUserProfileResultDTO})
  async putUpdateUserProfile(
    @GetMeta() meta: GetMeta, //
    @Body() body: UpdateUserProfileBodyDTO
  ): Promise<GetUserProfileResultDTO> {
    const result = await this.commandBus.execute(UpdateUserProfileCommand.new({...meta, ...body}));
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
    const result = await this.queryBus.execute(GetUserProfileQuery.new({...meta}));
    return result;
  }
  // #endregion
}
