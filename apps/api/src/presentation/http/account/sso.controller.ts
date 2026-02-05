import {SsoCallbackCommand} from '#/application/account/command';
import {GetSsoRedirectQuery} from '#/application/account/query';
import {SsoInvalidOAuthCodeError, SsoInvalidProviderError, SsoInvalidStateError} from '#/domain/account/error';
import {Controller, Get, HttpCode, HttpStatus, Param, Query, Res} from '@nestjs/common';
import {CommandBus, QueryBus} from '@nestjs/cqrs';
import {ApiResponse, ApiTags} from '@nestjs/swagger';
import {FastifyReply} from 'fastify';
import {GetMeta, MapDomainError} from '../_shared/decorator';
import {GetSsoRedirectParamsDTO, GetSsoRedirectQueryDTO, SsoCallbackQueryDTO} from './dto';

@ApiTags('sso')
@Controller('sso')
export class SsoController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus
  ) {}

  // #region getRedirect
  @Get(':provider')
  @HttpCode(HttpStatus.TEMPORARY_REDIRECT)
  @MapDomainError([SsoInvalidProviderError, HttpStatus.UNPROCESSABLE_ENTITY])
  @ApiResponse({
    status: HttpStatus.TEMPORARY_REDIRECT,
    description: 'Redirects to identity provider.',
  })
  async getRedirect(
    @GetMeta() envelope: GetMeta,
    @Param() params: GetSsoRedirectParamsDTO,
    @Query() query: GetSsoRedirectQueryDTO,
    @Res({passthrough: true}) reply: FastifyReply
  ): Promise<void> {
    const result = await this.queryBus.execute(
      new GetSsoRedirectQuery({
        ...envelope,
        ...params,
        callbackUrl: query.callback_url,
      })
    );
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    reply.redirect(result.redirectUrl, HttpStatus.TEMPORARY_REDIRECT);
  }
  // #endregion

  // #region getCallback
  @Get(':provider/callback')
  @HttpCode(HttpStatus.TEMPORARY_REDIRECT)
  @MapDomainError(
    [SsoInvalidProviderError, HttpStatus.UNPROCESSABLE_ENTITY],
    [SsoInvalidOAuthCodeError, HttpStatus.BAD_REQUEST],
    [SsoInvalidStateError, HttpStatus.BAD_REQUEST]
  )
  @ApiResponse({
    status: HttpStatus.TEMPORARY_REDIRECT,
    description: 'Redirects to frontend with token.',
  })
  async getCallback(
    @GetMeta() envelope: GetMeta, //
    @Param() params: GetSsoRedirectParamsDTO,
    @Query() query: SsoCallbackQueryDTO,
    @Res({passthrough: true}) reply: FastifyReply
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new SsoCallbackCommand({
        ...envelope,
        ...params,
        ...query,
      })
    );
    reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    reply.redirect(result.redirectUrl, HttpStatus.TEMPORARY_REDIRECT);
  }
  // #endregion
}
