import {type MessageMetadata} from '#/core/application/bus/message-metadata';
import {createParamDecorator, type ExecutionContext} from '@nestjs/common';

export const GetMessageMetadata = createParamDecorator((_data: unknown, ctx: ExecutionContext): MessageMetadata => {
  const {id: messageId, startTime: occurredAt = new Date()} = ctx.switchToHttp().getRequest();
  return {messageId, occurredAt};
});
