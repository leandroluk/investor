export interface ICreatable {
  /** @type {TIMESTAMPTZ[3]} */
  createdAt: Date;
}

export interface IDeletable {
  /** @type {TIMESTAMPTZ[3]} */
  deletedAt: Date | null;
}

export interface IIndexable {
  /** @type {UUIDv7} */
  id: string;
}

export interface IUpdatable {
  /** @type {TIMESTAMPTZ[3]} */
  updatedAt: Date;
}
