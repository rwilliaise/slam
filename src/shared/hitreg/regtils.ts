/** How much time should lag compensation remember. Adjust this if moves are frequently missing, but leave it low. */
export const LAG_COMP_MEMORY_SECONDS = 1
/** How many snapshots should lag compensation remember. Keep in mind that snapshots are expensive for memory. */
export const LAG_COMP_MEMORY_SIZE = 15
/** How many seconds between snapshots; in other words the resolution of lag compensation. Should be >=0.1 */
export const LAG_COMP_RESOLUTION = 0.1

/** How far up will melee attacks be (since there is no WorldRoot option for rr3) */
export const MELEE_DISPLACEMENT = 1000

export type Primitive =
        | null
        | undefined
        | string
        | number
        | boolean
        | symbol
        | bigint

export type PartialDeep<T> = T extends Primitive
  ? Partial<T>
  : T extends Map<infer KeyType, infer ValueType>
    ? PartialMapDeep<KeyType, ValueType>
    : T extends Set<infer ItemType>
      ? PartialSetDeep<ItemType>
      : T extends ReadonlyMap<infer KeyType, infer ValueType>
        ? PartialReadonlyMapDeep<KeyType, ValueType>
        : T extends ReadonlySet<infer ItemType>
          ? PartialReadonlySetDeep<ItemType>
          : T extends ((...args: any[]) => unknown)
            ? T | undefined
            : T extends object
              ? PartialObjectDeep<T>
              : unknown

interface PartialMapDeep<KeyType, ValueType> extends Map<PartialDeep<KeyType>, PartialDeep<ValueType>> {}

interface PartialSetDeep<T> extends Set<PartialDeep<T>> {}

interface PartialReadonlyMapDeep<KeyType, ValueType> extends ReadonlyMap<PartialDeep<KeyType>, PartialDeep<ValueType>> {}

interface PartialReadonlySetDeep<T> extends ReadonlySet<PartialDeep<T>> {}

type PartialObjectDeep<ObjectType extends object> = {
  [KeyType in keyof ObjectType]?: PartialDeep<ObjectType[KeyType]>
}
