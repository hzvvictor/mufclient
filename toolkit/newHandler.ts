
// type Handle = (req: any, res: any, next: Function) => Promise<any> | any;
interface Result<T> {
  success: boolean,
  data?: T,
  error?: any
}
export interface Response {
  isResolved: boolean,
  error: (error: any) => void,
  success: (data: any) => void,
};

export type Handle<REQ, RES> = (
  req: REQ,
  res: RES & Response,
  next: Function
) => Promise<any> | any;

const newHandler = <REQ extends Record<string, any>, RES extends Response>(
  _req: REQ,
  _res: RES | Partial<Response> = {}
) => {
  
  let config = {
    isShowError: true,
    isAutoResolve: true
  };
  const handler = async <Data>(...handles: (Handle<REQ, RES>)[]) => {
    let req = (_req || {}) as REQ;
    let res = (_res || {}) as RES;
  
    
    type Resolver = <T>(data: T) => Promise<Result<T>> | void;
    type Error = ({ resolve, res }: { resolve: Resolver, res: RES }) => (error: any) => void;
    type Success = ({ resolve, res }: { resolve: Resolver, res: RES }) => (data: Data) => void;

    
    const error: Error = ({ resolve, res }) => (error) => {
      res.isResolved = true;
      // console.log('isShowError', { isShowError: handler.config.isShowError, error });
      if (config.isShowError) console.error(error)

      if (error?.name === 'SequelizeDatabaseError') {
        return res.error({ message: error.message });
      }
      resolve({ success: false, error })
    };

    const success: Success = ({ resolve, res }) => (data: Data) => {
      // console.log('isAutoResolve', { isAutoResolve: handler.config.isAutoResolve });
      res.isResolved = true;
      resolve({ success: true, data })
    };

    const promise = new Promise(async (resolve: Resolver) => {
      res.isResolved = false;
      res.error = error({ resolve, res });
      res.success = success({ resolve, res });
      let index = 0;

      const next = async () => {
        if (res.isResolved) return;

        if (index < handles.length) {
          const currentMiddleware = handles[index++];
          // console.log(`MIDDLEWARES: ${index}/${handles.length} - ${res.isResolved ? 'RESOLVED' : 'PENDING'}`)
          // console.log(`MIDDLEWARES: ${index}/${handles.length} - ${res.isResolved ? 'RESOLVED' : 'PENDING'}`)
          await currentMiddleware(req, res, next)?.catch((error: any) => {
            // console.log('ERROR', error);
            res.error(error);
          });
        }
        if (index === handles.length - 1 && !res.isResolved) {
          if (config.isAutoResolve) res.success(`✔️ Default success`);
        }
      };

      await next().catch((error) => {
        // console.log('ERROR', error);
        res.error(error);
      });
    });
    promise.catch((error) => {
      // console.log('ERROR', error);
      res.error(error);
    })

    return promise as Promise<Result<Data>>;
  };




  handler.setConfig = (newConfig: typeof config) => {
    config = { ...config, ...newConfig };
  }

  return handler
}

type InitByHandles = <REQ extends object, RES extends Response>(...handles: Handle<REQ, RES>[]) => (req: REQ, res: RES | {}) => Promise<any>;

const initByHandles: InitByHandles = (...handles) => (req, res = {}) => newHandler(req, res)(...handles);

newHandler.handles = initByHandles;
newHandler
// const handler = newHandler({ a: 1 });
export default newHandler
