import { Socket } from "socket.io-client";

export interface IEventsBase {
  connect: string;
  disconnect: string;
  unauthorized: string;
  authenticate: string;
  join: string;
  leave: string;
  log: string;
};
interface IListenOptions {
  ref?: string;
  isOneListen?: boolean;
};
interface IListenData<T> {
  <C extends (arg0: T) => void>(callback: C, options?: IListenOptions): void;
};
interface IEmitData<T> {
  (data: T, options?: { isLog?: boolean }): void;
};

interface InferedInitHandler {
  <L = any, E = any>(event: string, socket: Socket): {
    listen: IListenData<L>;
    emit: IEmitData<E>;
    /**
     * @description Remueve un evento o un callback de un evento. Recibe la referencia de un evento o un callback para removerlo.
     */
    off: (refEventCallback: string | Function) => void;
    offCallback: (callback: Function) => void;
  }
};
/* interface InferedInitEvents {
  <Types extends Record<keyof Events, { listen: any, emit: any }>,
    Events extends IEventsBase>(socket: Socket, events: Events, eventsTypes?: Types): {
      [key in keyof Events]: ReturnType<InferedInitHandler>;
    }
}; */
interface IInitSocketEventsParams<Types extends Record<keyof Events, { listen: any, emit: any }>, Events extends IEventsBase> {
  socket: Socket;
  /**
   * @description Objeto de eventos. 
   * @example
   * const events = {
   *  unauthorized: "unauthorized",
   *  authenticate: "authenticate",
   * };
   */
  events: Events;
  /**
   * @description Tipos de eventos (Opcional), Es un objeto con la misma estructura que el objeto de eventos, pero con los tipos de datos que se esperan en los eventos es recomendable para tener una mejor documentación y autocompletado
   * @example
   * const eventsTypes = {
   * //* Le decimos que el evento unauthorized escuchará un objeto con una propiedad message de tipo string
   *  unauthorized: { listen: { message: '' }}, 
   * //* Le decimos que el evento authenticate escuchará un objeto con una propiedad isCorrect de tipo boolean y emitirá un objeto con las propiedades email y password de tipo string
   *  authenticate: { listen: { isCorrect: false }, emit: { email: '', password: '' } },
   * };
   */
  eventsTypes?: Types;
  /**
   * @description Si es verdadero, solo se permitirá un callback por evento o referencia
   */
  isUniqueCallbacksDefault?: boolean;
  /**
   * @description Si es verdadero, mostrará los logs en la consola. recomendado para desarrollo
   */
  isShowLogs?: boolean;
  /**
   * @description Nombre constante para mostrar en los logs
   */
  CONST_NAME?: string;
};
/**
 * @author Victor Manuel Hernandez Vargas - https://github.com/hzvvictor
 * @description Inicializa los eventos de un socket
 * @param {IInitSocketEventsParams} params - Parámetros
 * @returns {Handlers} - Manejadores de eventos
 * @example
 * const events = {
 *  unauthorized: "unauthorized",
 * authenticate: "authenticate",
 * };
 * const eventsTypes = { 
 * unauthorized: { listen: { message: '' }},
 * authenticate: { listen: { isCorrect: false }, emit: { email: '', password: '' } },
 * };
 * const socket = io();
 * const handlers = initEvents(socket, events, eventsTypes);
 * handlers.unauthorized.listen(({ message }) => console.log(message));
 * handlers.authenticate.emit({ email: 'example@example', password: '123456' });
  */
const initSocketEvents = <
  Types extends Record<keyof Events, { listen: any, emit: any }>,
  Events extends IEventsBase
>({
  socket,
  events,
  eventsTypes: _eventsTypes,
  isUniqueCallbacksDefault = true,
  isShowLogs = false,
  CONST_NAME = 'SOCKET',
}:
  IInitSocketEventsParams<Types, Events>) => {
  //* Antes de ejecutar los eventos base, agregamos los eventos base en caso de que no estén
  const addBaseEvents = (events: Events) => {
    if (!events.connect) events.connect = 'connect';
    if (!events.disconnect) events.disconnect = 'disconnect';
    if (!events.unauthorized) events.unauthorized = 'unauthorized';
    if (!events.authenticate) events.authenticate = 'authenticate';
    if (!events.join) events.join = 'join';
    if (!events.leave) events.leave = 'leave';
    if (!events.log) events.log = 'log';
  };
  addBaseEvents(events);
  // const CONST_NAME = 'MEETING';
  //* Infered Handlers !IMPORTANT
  type EventHandlers = {
    [key in keyof Events]: ReturnType<
      typeof initHandler<Types[key]['listen'], Types[key]['emit']>
    >;
  };
  const initHandler: InferedInitHandler = <L = any, E = any>(event: string, socket: Socket) => {
    const callbacks: { [key: string]: Function[] } = {};
    const uniqueCallbacks: { [key: string]: boolean } = {};

    interface IListenOptions {
      ref?: string;
      isUniqCallback?: boolean;
    };

    const listen = <C extends (arg0: L) => void>(callback: C, {
      ref = '',
      isUniqCallback = isUniqueCallbacksDefault
    }: IListenOptions = {}) => {
      if (!callback) return;

      if (isUniqCallback && ref in uniqueCallbacks) {
        const msg = `🔹 [${event}]:[LISTEN] [${ref}] [UNIQUE] [ERROR] Ya se ha registrado un callback único para este evento con la referencia '${ref}'`
        if (isShowLogs) console.log(msg);
        return;
      };
      if (isUniqCallback && event in uniqueCallbacks && !ref) {
        const msg = `🔹 [${event}]:[LISTEN] [UNIQUE] [ERROR] Ya se ha registrado un callback único para este evento`
        if (isShowLogs) console.log(msg);
        return;
      }
      // if (isOneListen && uniqueCallbacks[event]) return;
      if (isUniqCallback) uniqueCallbacks[ref] = true;

      if (isShowLogs) console.log(`🔹 [${event}]:[LISTEN]`)
      // console.log(`-------------------------`, { callback, ref, isOneListen });
      if (ref) {
        if (!callbacks[ref]) callbacks[ref] = [];
        if (isUniqCallback && callbacks[ref].length > 0) return;
        callbacks[ref].push(callback);
      } else {
        if (!callbacks[event]) callbacks[event] = [];
        if (isUniqCallback && callbacks[event].length > 0) return;
        callbacks[event].push(callback);
      };
      socket.on(event, callback as any);
    };

    const emit = (data: E, { isLog = false } = {}) => {
      if (isLog) console.log(`[${event}]:[EMIT]`, data);
      socket.emit(event, data);
    };
    const off = (refEventCallback: string | Function) => {
      const isCallback = typeof refEventCallback === 'function';
      if (isCallback) {
        offCallback(refEventCallback);
        return;
      }
      if (isShowLogs)
        console.log(`[${event}] Removiendo evento: '${isCallback ? 'callback' : refEventCallback}'`);
      if (callbacks[refEventCallback]) {
        callbacks[refEventCallback].forEach((callback) => {
          socket.off(event, callback as any);
        });
        //* Eliminar la bandera de callback único
        if (refEventCallback in uniqueCallbacks) delete uniqueCallbacks[refEventCallback];
        delete callbacks[refEventCallback];
        if (isShowLogs)
          console.log(`[${event}:REF] Todos los callbacks removidos de '${refEventCallback}'`);
      } else {
        callbacks[event].forEach((callback: Function) => {
          socket.off(event, callback as any);
        });
        //* Eliminar la bandera de callback único
        if (event in uniqueCallbacks) delete uniqueCallbacks[event];
        delete callbacks[event];
        if (isShowLogs)
          console.log(`[${event}] Todos los callbacks removidos de '${event}'`);
      }

    };
    const offCallback = (callback: Function) => {
      if (isShowLogs)
        console.log(`[${event}:?] Removiendo callback`);

      let isDeleted = false;
      let _key: string | null = null;
      Object.keys(callbacks).forEach((key) => {
        const index = callbacks[key].indexOf(callback);
        if (index > -1) {
          callbacks[key].splice(index, 1);
          socket.off(event, callback as any);
          isDeleted = true;

          //* Eliminar la bandera de callback único
          if (key in uniqueCallbacks) delete uniqueCallbacks[key];
          _key = key;
        }
      });
      if (isShowLogs) {
        if (isDeleted) console.log(`[${_key}] Callback removido`);
        else console.log(`[${_key}] Callback no encontrado`);
      }
    };


    return {
      event,
      listen,
      emit,
      off,
      offCallback,
    };
  };

  // interface IHanlders {
  //   [key: string]: ReturnType<typeof initHandler>;
  // }
  // type IHanlders = Record<keyof Events, ReturnType<typeof initHandler<Types[keyof Events]['listen'], Types[keyof Events]['emit']>>>;

  const handlers = Object.keys(events).reduce((acc, key) => {
    (acc as any)[key] = initHandler((events as any)[key], socket);
    return acc;
  }, {} as EventHandlers);
  const initListenerDegfault = () => {
    //* on connect
    handlers.connect.listen(() => {
      console.log(`✔️ [SOCKET:${CONST_NAME}]:[CONNECTED]`);
    }, { ref: 'connect:log' });

    //* on log
    handlers.log.listen((data) => {
      console.log(`✔️ [SOCKET:${CONST_NAME}:LOG]`, data);
    }, { ref: 'log:log' });
  };
  if (isShowLogs) initListenerDegfault();

  return handlers;
};

export default initSocketEvents;