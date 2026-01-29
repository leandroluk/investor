// prettier-ignore
export namespace ISearch {
  type TrueType<TType> = Exclude<TType, undefined | null>;
  type WithNot<TOperator extends string> = TOperator | `n${TOperator}`;

  export namespace Operator {
    export type String = WithNot<'eq' | 'like'>;
    export type Number = WithNot<'eq' | 'gt' | 'gte' | 'lt' | 'lte'>;
    export type Boolean = WithNot<'eq'>;
    export type Date = WithNot<'eq' | 'gt' | 'gte' | 'lt' | 'lte'>;
    export type Range = WithNot<'in'>;
  }
  export type Operator =
    | Operator.String
    | Operator.Number
    | Operator.Boolean
    | Operator.Date
    | Operator.Range;

  export type Pagination = {
    offset: number;
    limit: number;
  };

  export type FullText = {
    text?: string;
  };

  export namespace Where {
    export type Match<TType> = {
      [TKey in keyof TType]?:
      TrueType<TType[TKey]> extends Date ? Partial<Record<Operator.Date, Date>> :
      TrueType<TType[TKey]> extends string ? Partial<Record<Operator.String, string>> :
      TrueType<TType[TKey]> extends number ? Partial<Record<Operator.Number, number>> :
      TrueType<TType[TKey]> extends boolean ? Partial<Record<Operator.Boolean, boolean>> :
      never;
    };
    export type Range<TType> = {
      [TKey in keyof TType]?: {in?: Array<TType[TKey]>; nin?: Array<TType[TKey]>};
    };
  }
  export type Where<TType> = Where.Match<TType> & Where.Range<TType>;

  export namespace Project {
    export type Select<TType> = {select?: Array<string & keyof TType>};
    export type Remove<TType> = {remove?: Array<string & keyof TType>};
  }
  export type Project<TType> = Project.Select<TType> & Project.Remove<TType>;

  export type Sort<TType> = {[K in keyof TType]?: -1 | 1};

  export type Query<TType> = Partial<Pagination> & FullText & {
    where?: Where<TType>;
    project?: Project<TType>;
    sort?: Sort<TType>;
  };

  export type Result<TType extends object, P extends boolean = false> = Pagination & {
    items: P extends false ? Array<TType> : Array<Partial<TType>>;
    total: number;
  };
}
