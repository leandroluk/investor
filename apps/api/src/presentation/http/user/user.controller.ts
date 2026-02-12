import {
  GenerateUserWalletCommand,
  LinkUserWalletCommand,
  RequestWalletNonceCommand,
  UpdateUserProfileCommand,
  UploadDocumentCommand,
} from '#/application/user/command';
import {GetKycQuery, GetUserDocumentQuery, GetUserProfileQuery, ListUserDocumentQuery} from '#/application/user/query';
import {
  AuthUnauthorizedError,
  DocumentNotFoundError,
  KycNotFoundError,
  ProfileNotFoundError,
  UserNotFoundError,
} from '#/domain/account/errors';
import {Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Res, UseGuards} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTemporaryRedirectResponse,
} from '@nestjs/swagger';
import {FastifyReply} from 'fastify';
import {GetMeta, MapDomainError} from '../_shared/decorators';
import {AuthGuard, ChallengeGuard} from '../_shared/guards';
import {
  GenerateUserWalletBodyDTO,
  GenerateUserWalletResultDTO,
  GetKycResultDTO,
  GetUserProfileResultDTO,
  LinkUserWalletBodyDTO,
  LinkUserWalletResultDTO,
  RequestWalletNonceResultDTO,
  UpdateUserProfileBodyDTO,
  UploadDocumentBodyDTO,
  UploadDocumentResultDTO,
} from './dto';
import {GetUserDocumentParamDTO} from './dto/get-user-document.dto';
import {ListUserDocumentResultDTO} from './dto/list-user-document.dto';

@ApiTags('user')
@Controller('user')
@ApiBearerAuth()
@UseGuards(AuthGuard, ChallengeGuard)
@MapDomainError(
  [AuthUnauthorizedError, HttpStatus.UNAUTHORIZED],
  [UserNotFoundError, HttpStatus.NOT_FOUND],
  [KycNotFoundError, HttpStatus.NOT_FOUND],
  [ProfileNotFoundError, HttpStatus.NOT_FOUND],
  [DocumentNotFoundError, HttpStatus.NOT_FOUND]
)
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  // #region postRequestWalletNonce
  @Post('wallet/nonce')
  @ApiOperation({summary: 'Request wallet nonce'})
  @ApiCreatedResponse({type: RequestWalletNonceResultDTO})
  async postRequestWalletNonce(
    @GetMeta() meta: GetMeta //
  ): Promise<RequestWalletNonceResultDTO> {
    const result = await this.commandBus.execute(RequestWalletNonceCommand.new({...meta}));
    return result;
  }
  // #endregion

  // #region postLinkUserWallet
  @Post('wallet/link')
  @ApiOperation({summary: 'Link user wallet'})
  @ApiCreatedResponse({description: 'Wallet linked successfully', type: LinkUserWalletResultDTO})
  async postLinkUserWallet(
    @GetMeta() meta: GetMeta,
    @Body() body: LinkUserWalletBodyDTO
  ): Promise<LinkUserWalletResultDTO> {
    const result = await this.commandBus.execute(LinkUserWalletCommand.new({...meta, ...body}));
    return result;
  }
  // #endregion

  // #region postGenerateUserWallet
  @Post('wallet/generate')
  @ApiOperation({summary: 'Generate user wallet'})
  @ApiCreatedResponse({description: 'Wallet generated successfully', type: GenerateUserWalletResultDTO})
  async postGenerateUserWallet(
    @GetMeta() meta: GetMeta,
    @Body() body: GenerateUserWalletBodyDTO
  ): Promise<GenerateUserWalletResultDTO> {
    const result = await this.commandBus.execute(GenerateUserWalletCommand.new({...meta, ...body}));
    return result;
  }
  // #endregion

  // #region postUploadDocument
  @Post('document')
  @ApiOperation({summary: 'Upload a document'})
  @ApiCreatedResponse({description: 'Document uploaded successfully', type: UploadDocumentResultDTO})
  async postUploadDocument(
    @GetMeta() meta: GetMeta,
    @Body() body: UploadDocumentBodyDTO
  ): Promise<UploadDocumentResultDTO> {
    const result = await this.commandBus.execute(UploadDocumentCommand.new({...meta, ...body}));
    return result;
  }
  // #endregion

  // #region redirectToUserDocument
  @Get('document/:documentId')
  @ApiOperation({summary: 'Get document URL'})
  @ApiTemporaryRedirectResponse({description: 'Redirects to document url.'})
  async redirectToUserDocument(
    @GetMeta() meta: GetMeta, //
    @Param() params: GetUserDocumentParamDTO,
    @Res({passthrough: true}) reply: FastifyReply
  ): Promise<void> {
    const url = await this.queryBus.execute(GetUserDocumentQuery.new({...meta, ...params}));
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    reply.redirect(url, HttpStatus.TEMPORARY_REDIRECT);
  }
  // #endregion

  // #region getListUserDocument
  @Get('document')
  @ApiOperation({summary: 'List user documents'})
  @ApiOkResponse({description: 'User document list retrieved successfully', type: ListUserDocumentResultDTO})
  async getListUserDocument(
    @GetMeta() meta: GetMeta //
  ): Promise<ListUserDocumentResultDTO> {
    return await this.queryBus.execute(ListUserDocumentQuery.new({...meta}));
  }
  // #endregion

  // #region putUpdateUserProfile
  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'Update user profile'})
  @ApiOkResponse({description: 'User profile updated successfully', type: GetUserProfileResultDTO})
  async putUpdateUserProfile(
    @GetMeta() meta: GetMeta, //
    @Body() changes: UpdateUserProfileBodyDTO
  ): Promise<GetUserProfileResultDTO> {
    const result = await this.commandBus.execute(UpdateUserProfileCommand.new({...meta, changes}));
    return result;
  }
  // #endregion

  // #region getGetUserProfile
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'Get user profile'})
  @ApiOkResponse({description: 'Get user profile', type: GetUserProfileResultDTO})
  async getGetUserProfile(
    @GetMeta() meta: GetMeta //
  ): Promise<GetUserProfileResultDTO> {
    const result = await this.queryBus.execute(GetUserProfileQuery.new({...meta}));
    return result;
  }
  // #endregion

  // #region getGetKyc
  @Get('kyc')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({summary: 'Get user KYC status'})
  @ApiOkResponse({description: 'Get user kyc', type: GetKycResultDTO})
  async getGetKyc(
    @GetMeta() meta: GetMeta //
  ): Promise<GetKycResultDTO> {
    const result = await this.queryBus.execute(GetKycQuery.new({...meta}));
    return result;
  }
  // #endregion
}
