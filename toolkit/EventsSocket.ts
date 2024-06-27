import { Socket, io } from "socket.io-client";

type ID = string;

export interface ListenOptions {
  isOnlyLast?: boolean;
  isUniqueById?: boolean;
  isStricId?: boolean;
}

// Tipo para extraer el tipo de los IDs de un evento
export type ExtractIdType<T> = T extends { ids: infer U } ? keyof U : never;

// Tipo para extraer el tipo de los IDs de un evento que estén en true
export type ExtractIdTypeOnlyTrue<T> = T extends { ids: infer U } ? {
  [K in keyof U]: U[K] extends true ? K : never;
}[keyof U] : never;

class EventManager<Event extends {
  name?: Event['name'],
  listen: Event['listen'],
  emit: Event['emit'],
  ids: { [key: string]: boolean },
}> {
  private name: Event['name'];
  // private listeners: ((payload: Event['listen']) => void)[] = [];
  private listenersById: {
    [id: string]: ((payload: Event['listen']) => void)[],
  } = {};
  private isListening: boolean = false;
  private socket: Socket;
  private listenOptions: ListenOptions = {
    isOnlyLast: true,
    isUniqueById: true,
    isStricId: false,
  };
  private isListeningById: {
    [id: string]: boolean,
  } = {};
  private onPrimaryEvent: (payload: Event['listen']) => void = () => { };
  private IDs: { [key: string]: boolean };

  constructor(
    { name, ids }: Event,
    socket: Socket,
    listenOptions?: ListenOptions) {
    this.name = name;
    this.socket = socket;
    this.listenOptions = listenOptions || {
      isOnlyLast: true,
      isUniqueById: true,
    };
    this.IDs = ids;
  }

  listen(id: ExtractIdType<Event>, payload: (arg: Event['listen']) => void) {
    if (!id || !(typeof id === 'string' || typeof id === 'number')) {
      console.log(`\n\t⚠️ Check the ID of the event "${this.name}"\n`, {
        id,
        payload
      });
      return;
    }
    const isIdTrue = this.IDs && id in this.IDs && this.IDs[id];
    if (isIdTrue === false && this.listenOptions.isStricId) {
      console.warn(`\n\t⚠️ Please, if you are going to use the ID "${id}" in the event "${this.name}", make sure it is set to true in the event configuration.\n`);
      return;
    }
    //* If isOnlyLast is true, we will only keep the last listener
    if (this.listenOptions.isOnlyLast) {
      console.log(`\nÜt🚀 [Socket]: Listening:replaced -> '${this.name}' with ID -> '${id}'`);
      this.listenersById[id] = [payload];
    }

    //* If isUniqueById is true, we will only keep one listener per ID
    if (this.isListeningById[id] && this.listenOptions.isUniqueById) return;

    //* If isUniqueById is true, we will only keep one listener per ID
    if (this.listenOptions.isUniqueById) this.isListeningById[id] = true;

    //* If the listener is not already in the array, we add it, this can happen if isOnlyLast is false
    if (!(this.listenersById[id] || []).some((listener) => listener === payload)) {
      console.log(`\nÜt🚀 [Socket]: Listening -> '${this.name}' with ID -> '${id}'`);
      if (!this.listenersById[id]) this.listenersById[id] = [];
      this.listenersById[id].push(payload);
    }

    //* If we are not listening, we start listening and set the flag to true
    if (this.isListening) return;
    this.isListening = true;

    const onPrimaryEvent = (payload: Event['listen']) => {
      /* this.listeners.forEach((listener) => {
        listener(payload);
      }); */
      Object.keys(this.listenersById).forEach((id) => {
        this.listenersById[id].forEach((listener) => {
          listener(payload);
        });
      });

    }
    this.socket.on(this.name as string, onPrimaryEvent);
    this.onPrimaryEvent = onPrimaryEvent;
  }

  off(id: ID) {
    if (this.listenOptions.isUniqueById) {
      delete this.isListeningById[id];
    }

    //* If isUniqueById is true, we will only keep one listener per ID 
    if (Object.keys(this.isListeningById).length === 0) {
      this.isListening = false;
      this.socket.off(this.name as string, this.onPrimaryEvent);
      this.onPrimaryEvent = () => { };
    }
  }

  emit(payload: Event['emit']) {
    this.socket.emit(this.name as string, payload);
  }
}



type EventKeyDefault = (
  'disconnect'
  | 'connect'
  | 'unauthorized'
  | 'authenticate'
  | 'join'
  | 'leave'
  | 'log'
)
interface InitSocketIo {
  url: string;
  path: string;
  token: string | object;
};

class NameSpace {
  // public handleGetNamespace: () => Socket;
  private token: string | object;
  private url: string;
  private path: string;

  io({ url, path, token }: InitSocketIo) {
    if (token && typeof token == "object") token = JSON.stringify(token);
    console.log(`\n\t🚀 [Socket]: init into -> '${url}'`);
    const instance = io(url, {
      path,
      timeout: 1000 * 60 * 60,
      autoConnect: true,
      reconnectionDelay: 1000,
      // secure: true,
      transports: ["websocket", "polling"],
      auth: { token },
    });
    return instance;
  };

  private namespace(nsp: string) {
    const nspReplaceSlash = nsp.replace(/^\/|\/$/g, '');
    const token = 'token';
    const url = `${this.url}/${nspReplaceSlash}`;
    const path = this.path;
    const socket = this.io({ url, path, token });
    return socket;
  };

  to = this.namespace;

  constructor({ url, path, token }: InitSocketIo) {
    this.url = url;
    this.path = path;
    this.token = token;

    // this.handleGetNamespace = fn;
  }
}

class Events<T extends {
  [K in keyof T]: {
    ids: { [key: string]: boolean },
    listen: any,
    emit: any,
    options: ListenOptions,
  } | string
}> {
  private _events: T;
  constructor(events: T) {
    this._events = events;
  }
  get events() {
    return this._events;
  }
};

class HandleEvents<E extends {
  [K in EventKey]: {
    ids: { [key: string]: boolean },
    listen: any,
    emit: any,
    options: ListenOptions,
  }
}, EventKey extends keyof E | EventKeyDefault> {
  private fn: () => E;
  constructor(fn: () => E) {
    this.fn = fn;
  }
}
class EventsSocket<E extends {
  [K in EventKey]: {
    ids: { [key: string]: boolean },
    listen: any,
    emit: any,
    options: ListenOptions,
  }
}, EventKey extends keyof E | EventKeyDefault> {
  private eventManager: {
    [K in EventKey]: EventManager<E[K]>;
  };
  private _socket: Socket;
  private _section: string = 'SOCKET';
  /* constructor(events: E, socket: Socket) {
    this.eventManager = {} as any;
    for (const key in events) {
      this.eventManager[key as string] = new EventManager({
        name: key as string,
        listen: events[key].listen,
        emit: events[key].emit,
        ids: events[key].ids,
      }, socket, events[key].options);
    }
  } */
  private addDefaultEvents(events: E): E {
    const defaultObject = {
      ids: {},
      listen: {},
      emit: {},
      options: {},
    };
    if (!('disconnect' in events)) (events as any).disconnect = defaultObject;
    if (!('connect' in events)) (events as any).connect = defaultObject;
    if (!('unauthorized' in events)) (events as any).unauthorized = defaultObject;
    if (!('authenticate' in events)) (events as any).authenticate = defaultObject;
    if (!('join' in events)) (events as any).join = defaultObject;
    if (!('leave' in events)) (events as any).leave = defaultObject;
    if (!('log' in events)) (events as any).log = defaultObject;
    return events;
  }
  /* constructor(SECTION: string = 'SOCKET', socket: Socket, events: () => Events<E & {
    [K in EventKey]: {
      ids: { [key: string]: boolean },
      listen: any,
      emit: any,
      options: ListenOptions,
    }
  }>) { */
  constructor({ section: SECTION = 'SOCKET', events, nameSpace }: {
    section: string, nameSpace: Socket, events: Events<E & {
      [K in EventKey]: {
        ids: { [key: string]: boolean },
        listen: any,
        emit: any,
        options: ListenOptions,
      }
    }>
  }) {
    this.eventManager = {} as any;
    this._socket = nameSpace;
    // const eventsConfig = events();
    const eventsConfig = this.addDefaultEvents(events.events);
    for (const key in eventsConfig) {
      (this.eventManager as any)[key as string] = new EventManager({
        name: key as string,
        listen: eventsConfig[key].listen,
        emit: eventsConfig[key].emit,
        ids: eventsConfig[key].ids,
      }, this._socket, eventsConfig[key].options);
    }
    this._section = SECTION;

    (this.eventManager as any).connect.listen('init', (payload: any) => {
      console.log(`✨ ${SECTION} -> [CONNECTED]`, payload);
    });

    (this.eventManager as any).log.listen('init', (payload: any) => {
      console.log(`✨ ${SECTION} -> [LOG]`, payload);
    })
  }

  get events() {
    return this.eventManager;
  }
  get socket() {
    return this._socket;
  }
}
export {
  NameSpace,
  Events,
  EventsSocket,

  HandleEvents,
  EventManager,
  // ExtractIdType,
  // ExtractIdTypeOnlyTrue,
};
const example = () => {
  const nameSpace = new NameSpace({
    url: 'http://localhost:3000',
    path: '/',
    token: '',
  });

  const events = new Events({
    connect: {
      ids: { init: true, example: true },
      listen: {
        id: '',
        age: 0,
        user: {
          name: '',
        }
      },
      emit: {
        token: '',
      },
      options: {},
    },
    log: {
      ids: { init: true },
      listen: {},
      emit: {},
      options: {},
    },
  });

  const eventsSocket = new EventsSocket({
    section: 'example',
    nameSpace: nameSpace.to('/example'),
    events
  });

  // Ejemplo de uso
  eventsSocket.events.connect.listen('example', (payload) => {
    console.log('a', payload);
  });


  eventsSocket.events.connect.emit({
    token: ''
  });
};