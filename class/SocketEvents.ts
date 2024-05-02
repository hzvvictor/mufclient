import { Socket } from "socket.io-client";
import fnHandler from "../toolkit/fnHandler";
import initSockeIo, { InitSocketIo } from "../toolkit/initSocketIo";

interface EventCallbackConfig {
  ref: string;
  isUnique: boolean;
}
type EventCallback = (data?: any) => any;
type HandlerEventCallback = (data?: any) => any;

class SocketEvents<TEvents extends string> {
  private _events: Record<TEvents, string>;
  private _socket: Socket;
  private _emitDefault: Partial<Record<TEvents, any>> = {};
  private listeners: Record<string, HandlerEventCallback[]> = {};
  public events: Record<
    TEvents,
    {
      on: (callback: HandlerEventCallback, config?: EventCallbackConfig) => any;
      emit: <T>(data: T) => any;
    }
  >;
  private initEvents = () => {
    const eventKeys: Record<
      TEvents,
      {
        on: (callback: (data: any, config?: any) => void) => void;
        emit: <T>(data: T) => any;
      }
    > = {} as any;
    for (const _event in this._events) {
      const event = (this._events as any)[_event];

      const listener = fnHandler((callback: HandlerEventCallback, config?: EventCallbackConfig) => {

        //* Cuando se registra un evento como único, se elimina el listener anterior
        if (config?.isUnique) {
          this._socket.off(event);
          this.listeners[event] = [];
        };

        //* La referencia solo se usa para mostrar en consola
        if (config?.ref) {
          console.log(`\n\t🚀 [Socket:Listener] -> [REF:${config?.ref}] -> ${event}`);
        } else {
          console.log(`\n\t🚀 [Socket:Listener] -> ${event}`);
        };

        this._socket.on(event, callback);

        if (!(event in this.listeners)) this.listeners[event] = [];
        this.listeners[event].push(callback);
        // this.listeners[event] = callback;
      });
      // listener((data, config) => {});

      type Emit = <T>(data: T) => any;
      const emit: Emit = (data) => {
        console.log("emit", event, data);
        this._socket.emit(event, data);
      };

      const emitDefault = async (data: any) => {
        const emitDefault = this._emitDefault[_event];
        if (emitDefault && typeof emitDefault === "function") {
          const res = await emitDefault(data);
          console.log(`\n\t🚀 [Socket:emitDefault] -> ${_event}`, res);
          this._socket.emit(event, res);
        }
      };

      const isEmitDefault = _event in this._emitDefault;
      const finalEmit = isEmitDefault ? emitDefault : emit;

      (eventKeys as any)[_event] = {
        on: listener,
        emit: finalEmit,
      };
    }
    return eventKeys;
  };
  constructor({
    socket: _socket,
    events,
    emitDefault,
  }: {
    socket: Socket;
    events: Record<TEvents, string>;
    emitDefault?: Partial<Record<TEvents, any>>;
  }) {
    this._events = events as any;
    this._socket = _socket;
    this._emitDefault = emitDefault || {};
    this.events = this.initEvents() as any;
  }

  setSocketByConfig = (config: InitSocketIo) => {
    this.setSocket(initSockeIo(config));
  };

  setSocket = (_socket: Socket) => {
    //* Desconectar el socket actual
    if (this._socket) {
      this._socket.disconnect();
    }
    //* Inicializar el nuevo socket
    this._socket = _socket;

    //* Escuchar sobre los eventos, con los listeners previamente registrados
    for (const event in this.listeners) {
      const listeners = this.listeners[event];
      console.log(`\n\t✔️ [Socket:Listen] -> ${event}`);
      listeners.forEach((listener) => {
        this._socket.on(event, listener);
      });
    }
  };
  getEvents = () => {
    return this.events;
  };
  getSocket = () => {
    return this._socket;
  };
};
/**
 * @description
 * Inicializa una instancia de SocketEvents
 * @template TEvents - Eventos a escuchar
 * @param {Socket} socket - Instancia de Socket.io
 * @param {Record<TEvents, string>} events - Eventos a escuchar
 * @param {Record<TEvents, any>} emitDefault - Eventos a emitir por defecto
 * @returns {SocketEvents<TEvents>} - Instancia de SocketEvents
 */
const newSocketEvents = (socket: Socket, events: Record<string, string>, emitDefault?: Record<string, any>) => {
  const instance = new SocketEvents({
    socket,
    events,
    emitDefault,
  });
  return instance;
};
export { newSocketEvents };
export default SocketEvents;