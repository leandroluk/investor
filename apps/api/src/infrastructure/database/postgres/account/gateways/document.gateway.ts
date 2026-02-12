import {Throws} from '#/application/_shared/decorators';
import {DatabasePort} from '#/domain/_shared/ports';
import {DocumentStatusEnum} from '#/domain/account/enums';
import {DocumentGateway as Interface} from '#/domain/account/gateways';
import {DocumentView as View} from '#/domain/account/views';
import {InjectableExisting} from '#/infrastructure/_shared/decorator';
import {Inject} from '@nestjs/common';
import {DatabasePostgresDAO as DAO} from '../../postgres.dao';
import {DatabasePostgresError} from '../../postgres.error';

@Throws(DatabasePostgresError)
@InjectableExisting(Interface)
export class DatabasePostgresDocumentGateway extends DAO<View> implements Interface {
  constructor(@Inject(DatabasePort) private readonly database: DatabasePort.Transaction) {
    super('vw_document', {
      id: 'id',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      userId: 'user_id',
      type: 'type',
      storageKey: 'storage_key',
      status: 'status',
      rejectReason: 'reject_reason',
      profileName: 'profile_name',
      userEmail: 'user_email',
      kycStatus: 'kyc_status',
    });
  }

  async findByStatus(
    status: DocumentStatusEnum,
    limit: number,
    offset: number
  ): Promise<{items: View[]; total: number}> {
    const [items, [count]] = await Promise.all([
      this.database.query<View>(
        `SELECT ${this.selectAsPart}
         FROM "${this.tableName}"
         WHERE "status" = $1
         ORDER BY "updated_at" DESC
         LIMIT $2 OFFSET $3`,
        [status, limit, offset]
      ),
      this.database.query<{total: string}>(
        `SELECT COUNT(*) as total
         FROM "${this.tableName}"
         WHERE "status" = $1`,
        [status]
      ),
    ]);

    return {
      items,
      total: Number(count?.total || 0),
    };
  }
}
