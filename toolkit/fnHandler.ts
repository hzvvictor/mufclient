import newHandler from "./newHandler";

type ResponseType<T> =
  T extends (...args: any[]) => Promise<infer R> ? R :
  T extends (...args: any[]) => infer R ? R :
  never;

export type ParamsType<T> = T extends (...args: infer P) => any ? P : never;
export type FunctionTypeSync<T> = (...params: ParamsType<T>) => ResponseType<T>;
export type FunctionTypeAsync<T> = (...params: ParamsType<T>) => Promise<ResponseType<T>>;
export type FunctionTypeAsyncNull<T> = (...params: ParamsType<T>) => Promise<ResponseType<T> | null>;
type FnAsyncReturnCustom<T, R = unknown> = (...params: ParamsType<T>) => Promise<ResponseType<T> | R>;

const fnHandler = <T, Callback extends Function>(callback: Callback) => {
  type CallbackFunction = FnAsyncReturnCustom<Callback, null>;
  const handler = newHandler({});
  const fn = async (...args: any[]) => {
    const response = await handler(
      async (_req, res, next) => {
        const output = await callback(...args);
        res.success(output);
        next();
      },
    );
    const output = await response.data ? response.data : null;
    // console.log('<<<output>>>', output);
    return output as T | null;
  };
  return fn as unknown as CallbackFunction;

};
/* const asyncFn = async (arg1: string, arg2: number) => {
  console.log('<<ASYNC FN>>', { arg1, arg2 });
  // throw new Error('Error');
  const rdnNumber = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const n = rdnNumber(1, 5);
  if(n < 3) throw new Error('Error');
  return n;
}

const main = async() => {
  const fn = fnHandler(asyncFn);
  const res = await fn('Hello', 123);
  console.log('<<RES>>', res);
};

main(); */

export default fnHandler;