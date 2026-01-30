import {type CreatableEntity, type IndexableEntity, type UpdatableEntity} from '#/domain/_shared/entity';
import {type AddressValueObject} from '#/domain/_shared/value-object';
import {ApiProperty} from '@nestjs/swagger';
import {type SymbolValueObject} from '../value-object';

export class AssetEntity implements IndexableEntity, CreatableEntity, UpdatableEntity {
  @ApiProperty({
    example: '018f3b5e-1234-7000-8000-000000000000',
    description: 'Unique identifier for the asset (UUIDv7)',
    format: 'uuid',
  })
  id!: string;

  @ApiProperty({
    example: 'USDT',
    description: 'The ticker symbol of the asset',
    type: String,
  })
  symbol!: SymbolValueObject;

  @ApiProperty({
    example: 'Tether USD',
    description: 'The full legal or common name of the asset',
  })
  name!: string;

  @ApiProperty({
    example: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    description: 'The smart contract address on the blockchain',
    type: String,
  })
  contractAddress!: AddressValueObject;

  @ApiProperty({
    example: 1,
    description: 'The EIP-155 chain ID (e.g., 1 for Ethereum Mainnet, 137 for Polygon)',
  })
  chainId!: number;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of asset creation in the system',
  })
  createdAt!: Date;

  @ApiProperty({
    example: new Date(),
    description: 'Timestamp of the last update to asset metadata',
  })
  updatedAt!: Date;
}
