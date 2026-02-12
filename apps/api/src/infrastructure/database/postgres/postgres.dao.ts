import {type TIndexable} from '#/domain/_shared/types';

export abstract class DatabasePostgresDAO<TEntity extends TIndexable> {
  protected readonly selectAsPart: string;
  protected readonly valuesPart: string;

  constructor(
    protected readonly tableName: string,
    protected readonly fieldMap: Record<keyof TEntity, string>
  ) {
    const entries = Object.entries(this.fieldMap);
    this.selectAsPart = entries.map(([key, field]) => `"${field}" AS "${key}"`).join(', ');
    this.valuesPart = Array.from({length: entries.length}, (_, i) => `$${i + 1}`).join(', ');
  }

  protected makeInsertOne(entity: Partial<TEntity>): {cols: string; places: string; values: any[]} {
    const entries = Object.entries(entity);
    const columns: string[] = [];
    const values: any[] = [];
    const placeholders: string[] = [];

    let index = 1;

    for (const [key, value] of entries) {
      const dbField = this.fieldMap[key as keyof TEntity];

      if (dbField && value !== undefined) {
        columns.push(`"${dbField}"`);
        placeholders.push(`$${index++}`);
        values.push(value);
      }
    }

    return {
      cols: columns.join(', '),
      places: placeholders.join(', '),
      values,
    };
  }

  protected makeUpdate(fields: Partial<TEntity>, paramOffset: number = 1): {setClause: string; values: any[]} {
    const entries = Object.entries(fields);
    const setParts: string[] = [];
    const values: any[] = [];

    let index = paramOffset;

    for (const [key, value] of entries) {
      const dbField = this.fieldMap[key as keyof TEntity];
      if (dbField && value !== undefined) {
        setParts.push(`"${dbField}" = $${index++}`);
        values.push(value);
      }
    }

    return {
      setClause: setParts.join(', '),
      values,
    };
  }
}
