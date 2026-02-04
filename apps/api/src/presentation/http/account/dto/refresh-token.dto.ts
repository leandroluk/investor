import {ApiProperty} from '@nestjs/swagger';

export class RefreshTokenBodyDTO {
  @ApiProperty({
    description: 'Refresh token',
    example: 'ey...',
  })
  readonly refreshToken!: string;
}
