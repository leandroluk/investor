export const Auditable = Object.assign(
  (action: Auditable.Action): ClassDecorator => {
    return (target: any) => {
      const metadata: Auditable.Metadata = {action};
      Reflect.defineMetadata(Auditable.KEY, metadata, target);
    };
  },
  {
    KEY: Symbol('Auditable'),
    getMetadata: (target: any) => {
      return Reflect.getMetadata(Auditable.KEY, target) as Auditable.Metadata | undefined;
    },
  }
);

export namespace Auditable {
  export type Action =
    | 'RESET_PASSWORD'
    | 'REVOKE_DEVICE'
    | 'TOGGLE_2FA'
    | 'LINK_WALLET'
    | 'REVEAL_SEED'
    | 'REVIEW_DOCUMENT_ADMIN'
    | 'CREATE_WITHDRAWAL'
    | 'CONFIRM_WITHDRAWAL';

  export type Metadata = {
    action: Action;
  };
}
