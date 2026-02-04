import {type Creatable, type Indexable} from '#/domain/_shared/interface';
import {ApiProperty} from '@nestjs/swagger';

export class AssetEntity implements Indexable, Creatable {
  @ApiProperty({
    example: '018f3b5e-9012-7000-8000-000000000000',
    description: 'Unique identifier for the asset entry (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: 'usdc-polygon',
    description: 'Unique identifier for the asset (slug)',
  })
  slug!: string;

  @ApiProperty({
    example: 'USDC',
    description: 'Ticker symbol of the asset',
  })
  symbol!: string;

  @ApiProperty({
    example: 'polygon',
    description: 'Blockchain network where the asset resides',
  })
  network!: string;

  @ApiProperty({
    example: true,
    description: 'Whether the asset is currently enabled for investments',
  })
  isActive!: boolean;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp when the asset was supported',
  })
  createdAt!: Date;
}
