import axios, { AxiosResponse, AxiosInstance, AxiosRequestConfig } from 'axios';
import Swal from 'sweetalert2';

interface ISetUrlConfig<T> {
  type: T;
  keyError?: string;
}

// Clase APIClient
class APIClient {
  private baseURL: string;
  private API: AxiosInstance;
  private getterToken: () => any;

  constructor(baseURL: string, { getToken }: { getToken: () => any }) {
    this.baseURL = baseURL;
    this.API = axios.create({ baseURL });
    this.getterToken = getToken;
  }

  private async SwalErrorRequest(message: string) {
    await Swal.fire({
      icon: 'info',
      text: message,
      html: `<p style="font-size: 25px;">${message}</p>`,
      timer: 3200,
      timerProgressBar: true,
    });
  }

  private buildRequest<T>({ method, url, type, keyError = 'message' }: IBuildRequest<T>) {
    const isWithData = {
      put: true,
      post: true,
      get: false,
      delete: false,
    };
    const controlador = (promise: Promise<AxiosResponse<T>>, {
      onCatch,
      isSwalError = false,
      isIgnoreError = false,
      fullUrl
    }: IControllerOptions) => new Promise<Error | null | AxiosResponse<T>>((resolve, reject) => {
      promise.then((res) => resolve(res)
      ).catch((err) => {

        if (!err.response?.data) {
          console.warn(`\n\t ⚠️ [ERROR:API]: ${fullUrl}:  ⚠️ \n`, err)
          return
        }
        // const errorKey = 'message'
        const message = err.response.data?.[keyError] || 'Error desconocido';
        if (isIgnoreError) return resolve(null);
        if (isSwalError) this.SwalErrorRequest(message);
        if (onCatch) onCatch(err);
        reject(err)
      })
    })

    const request = async <Body>(req: IRequest<Body>) => {
      const fullUrl = `${this.baseURL}${url}${req.id ? `/${req.id}` : ''}`;
      const config: AxiosRequestConfig<any> = {
        params: req.query,
        ...req.config,
        data: req.body,
        headers: {
          Authorization: this.getterToken(),
        },
      };
      const withData = () =>
        this.API[method](
          fullUrl,
          req.body,
          // APIConfigToken({ params: req.query, ...req.config, data: req.body })
          config
        );
      const withoutData = () => {
        delete config.data;
        return this.API[method](fullUrl, config);
      }
      const promise = isWithData[method] ? withData() : withoutData();
      const response = await controlador(promise, { onCatch: req.onCatch, isSwalError: req.isSwalError, isIgnoreError: req.isIgnoreError, fullUrl });

      const isNotData = response instanceof Error || !response;

      if (isNotData) return null;
      return response.data;
    };

    return request;
  }

  public url<T>(urlProp: string, config: ISetUrlConfig<T> = { type: {} as T, keyError: 'message' }) {

    const url = urlProp.startsWith('/') ? urlProp : `/${urlProp}`;
    return {
      Get: this.buildRequest({ ...config, method: 'get', url }),
      Post: this.buildRequest({ ...config, method: 'post', url }),
      Put: this.buildRequest({ ...config, method: 'put', url }),
      Del: this.buildRequest({ ...config, method: 'delete', url } as {
        method: 'delete';
        url: string;
        type: T | boolean;
      }),
    };
  }
}

// Interfaces usadas en la clase APIClient
interface IBuildRequest<T> {
  method: 'get' | 'post' | 'put' | 'delete';
  url: string;
  type: T;
  keyError?: string;
}

interface IControllerOptions {
  onCatch?: any;
  isSwalError?: boolean;
  isIgnoreError?: boolean;
  fullUrl: string;
  keyError?: string;
}

interface Query {
  where: Record<string, any>
  attributes: string[]
};
interface IRequest<B = any> extends Omit<IControllerOptions, 'fullUrl'> {
  id?: string | number;
  body?: B;
  query?: Query;
  config?: AxiosRequestConfig;
}
// const API = new APIClient('https://api.example.com', { getToken });
// const userAPI = API.url('/users', { type: { id: 0, name: '' } });

export default APIClient;