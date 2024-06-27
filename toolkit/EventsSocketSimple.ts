import { Socket, io } from "socket.io-client";

type ID = string;

// Tipo para los eventos simplificados
type EventName = 'disconnect' | 'connect' | 'unauthorized' | 'authenticate' | 'join' | 'leave' | 'log' | string;
type EventConfig = string

interface ListenOptions {
  isOnlyLast?: boolean;
  isUniqueById?: boolean;
}

class EventManager {
  private name: EventName;
  private listenersById: Record<string, ((payload: any) => void)[]> = {};
  private isListening: boolean = false;
  private socket: Socket;
  private listenOptions: ListenOptions;
  private isListeningById: Record<string, boolean> = {};
  private onPrimaryEvent: (payload: any) => void = () => { };

  constructor(
    name: EventName,
    socket: Socket,
    listenOptions?: ListenOptions
  ) {
    this.name = name;
    this.socket = socket;
    this.listenOptions = listenOptions || {
      isOnlyLast: true,
      isUniqueById: true,
    };
  }

  listen(id: ID, payload: (arg: any) => void) {
    if (!id || typeof id !== 'string') {
      console.log(`\n\t⚠️ Check the ID of the event "${this.name}"\n`, { id, payload });
      return;
    }

    if (this.listenOptions.isOnlyLast) {
      console.log(`\n🚀 [Socket]: Listening:replaced -> '${this.name}' with ID -> '${id}'`);
      this.listenersById[id] = [payload];
    }

    if (this.isListeningById[id] && this.listenOptions.isUniqueById) return;

    if (this.listenOptions.isUniqueById) this.isListeningById[id] = true;

    if (!(this.listenersById[id] || []).some((listener) => listener === payload)) {
      console.log(`\n🚀 [Socket]: Listening -> '${this.name}' with ID -> '${id}'`);
      if (!this.listenersById[id]) this.listenersById[id] = [];
      this.listenersById[id].push(payload);
    }

    if (this.isListening) return;
    this.isListening = true;

    const onPrimaryEvent = (payload: any) => {
      Object.keys(this.listenersById).forEach((id) => {
        this.listenersById[id].forEach((listener) => {
          listener(payload);
        });
      });
    };
    this.socket.on(this.name as string, onPrimaryEvent);
    this.onPrimaryEvent = onPrimaryEvent;
  }

  off(id: ID) {
    if (this.listenOptions.isUniqueById) {
      delete this.isListeningById[id];
    }

    if (Object.keys(this.isListeningById).length === 0) {
      this.isListening = false;
      this.socket.off(this.name as string, this.onPrimaryEvent);
      this.onPrimaryEvent = () => { };
    }
  }

  emit(payload: any) {
    this.socket.emit(this.name as string, payload);
  }
}

interface InitSocketIo {
  url: string;
  path: string;
  token: string | object;
}

class NameSpace {
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
      transports: ["websocket", "polling"],
      auth: { token },
    });
    return instance;
  }

  private namespace(nsp: string) {
    const nspReplaceSlash = nsp.replace(/^\/|\/$/g, '');
    const token = 'token';
    const url = `${this.url}/${nspReplaceSlash}`;
    const path = this.path;
    const socket = this.io({ url, path, token });
    return socket;
  }

  to = this.namespace;

  constructor({ url, path, token }: InitSocketIo) {
    this.url = url;
    this.path = path;
    this.token = token;
  }
}

class Events {
  private _events: { [key in EventName]: string };
  constructor(events: { [key in EventName]: string }) {
    this._events = events;
  }
  get events() {
    return this._events;
  }
}

class EventsSocket {
  private eventManager: { [key in EventName]: EventManager };
  private _socket: Socket;
  private _section: string = 'SOCKET';

  constructor({ section: SECTION = 'SOCKET', events, nameSpace }: {
    section: string, nameSpace: Socket, events: Events
  }) {
    this.eventManager = {} as any;
    this._socket = nameSpace;
    const eventsConfig = this.addDefaultEvents(events.events);
    for (const key in eventsConfig) {
      this.eventManager[key as string] = new EventManager(
        key as string,
        this._socket,
        {}
      );
    }
    this._section = SECTION;

    this.eventManager.connect.listen('init', (payload: any) => {
      console.log(`✨ ${SECTION} -> [CONNECTED]`, payload);
    });

    this.eventManager.log.listen('init', (payload: any) => {
      console.log(`✨ ${SECTION} -> [LOG]`, payload);
    });
  }

  private addDefaultEvents(events: { [id: string]: string }) {

    if (!('disconnect' in events)) events.disconnect = 'disconnect';
    // if (!('connect' in events)) events.connect = 'connect';
    if (!('unauthorized' in events)) events.unauthorized = 'unauthorized';
    if (!('authenticate' in events)) events.authenticate = 'authenticate';
    if (!('join' in events)) events.join = 'join';
    if (!('leave' in events)) events.leave = 'leave';
    if (!('log' in events)) events.log = 'log';
    return events;
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
  EventManager,
};

// Ejemplo de uso
const example = () => {
  const nameSpace = new NameSpace({
    url: 'http://localhost:3004',
    path: '/',
    token: '',
  });

  const events = new Events({
    connect: 'connect',
    log: 'log',
  });

  const eventsSocket = new EventsSocket({
    section: 'example',
    nameSpace: nameSpace.to('/example'),
    events
  });

  // Ejemplo de uso
  eventsSocket.events.connect.listen('example', (payload) => {
    console.log(payload);
  });

  eventsSocket.events.connect.emit({
    token: ''
  });
};

example();