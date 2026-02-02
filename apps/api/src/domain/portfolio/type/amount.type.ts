import {z} from 'zod';

export const amountSchema = z
  .string()
  .regex(/^\d+(\.\d+)?$/, 'INVALID_AMOUNT_FORMAT')
  .brand<'Amount'>();

export type Amount = z.infer<typeof amountSchema>;

function AmountConstructor(value: string | number | bigint): Amount {
  return amountSchema.parse(String(value));
}

export const Amount = Object.assign(AmountConstructor, {
  toBigInt: (amount: Amount, decimals = 18): bigint => {
    const [integer, fraction = ''] = amount.split('.');
    const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
    return BigInt(integer + paddedFraction);
  },

  fromBigInt: (value: bigint, decimals = 18): Amount => {
    const s = value.toString().padStart(decimals + 1, '0');
    const pos = s.length - decimals;
    const result = `${s.slice(0, pos)}.${s.slice(pos)}`.replace(/\.?0+$/, '').replace(/^\./, '0.');
    return amountSchema.parse(result || '0');
  },

  add: (a: Amount, b: Amount, decimals = 18): Amount => {
    const aBig = Amount.toBigInt(a, decimals);
    const bBig = Amount.toBigInt(b, decimals);
    return Amount.fromBigInt(aBig + bBig, decimals);
  },

  format: (amount: Amount, fractionDigits = 2): string => {
    const [integer, fraction = ''] = amount.split('.');
    if (fractionDigits === 0) {
      return integer!;
    }
    return `${integer}.${fraction.padEnd(fractionDigits, '0').slice(0, fractionDigits)}`;
  },
});
