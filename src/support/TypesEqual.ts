/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

type FunctionComparisonEqualsWrapped<T> =
  T extends (T extends {} ? infer R & {} : infer R)
  ? { [P in keyof R]: R[P] }
  : never;

type FunctionComparisonEquals<A, B> =
  (<T>() => T extends FunctionComparisonEqualsWrapped<A> ? 1 : 2) extends
   <T>() => T extends FunctionComparisonEqualsWrapped<B> ? 1 : 2
  ? true
  : false;

type IsAny<T> = FunctionComparisonEquals<T, any>;

type InvariantComparisonEqualsWrapped<T> =
  { value: T; setValue: (value: T) => never };

type InvariantComparisonEquals<Expected, Actual> =
  InvariantComparisonEqualsWrapped<Expected> extends
  InvariantComparisonEqualsWrapped<Actual>
  ? IsAny<Expected | Actual> extends true
    ? IsAny<Expected> | IsAny<Actual> extends true
          ? true
          : false
      : true
  : false;

export default TypesEqual;
export type TypesEqual<Expected, Actual> =
  InvariantComparisonEquals<Expected, Actual> extends true
  ? FunctionComparisonEquals<Expected, Actual>
  : false;

export type TypesNotEqual<Expected, Actual> =
  TypesEqual<Expected, Actual> extends true ? false : true;
