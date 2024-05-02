/* 
 * StateNs.ts
  Se encarga de manejar el estado de la aplicación que no son serializables, como las instancias de socket.io, o un componente de react o una instancia de una clase, etc.
  Tiene la ventaja de que se puede acceder a la instancia de la clase en cualquier parte de la aplicación, y se puede modificar el estado de la aplicación de manera centralizada.
*/
type Listener = {
  [id: string]: Array<(value: any) => void>;
};
interface ConfigListener {
  id: string;
  isUnique?: boolean;
}
// type Listener<T extends object> = Record<keyof T, Array<(value: any) => void>>;
class StateNs<T extends object> {
  private _state: T;
  private _listeners: Listener = {};

  constructor(state: T) {
    this._state = state;
    this._listeners = {};
  }

  public get state() {
    return this._state;
  }

  public set state(newState: T) {
    this._state = newState;
    Object.keys(this._listeners).forEach((id) => {
      this._listeners[id].forEach((listener) => listener(newState));
    });
  }

  public suscribe(callback: (value: any) => void, { id = 'default', isUnique = false }: Partial<ConfigListener> = {}) {
    if (id in this._listeners) {
      if (isUnique) {
        this._listeners[id] = [];
      }
    } else {
      this._listeners[id] = [];
    };
    this._listeners[id].push(callback);
    return this;
  };

  public unsuscribe(id: string) {
    delete this._listeners[id];
    return this;
  }
  setDeep(keyDeep: string, value: any) {
    const keys = keyDeep.split(".");
    // console.log(`before`, this.state)
    keys.reduce((acc: any, key: any) => {
      if (key !== keys[keys.length - 1]) {
        if (!acc[key]) {
          acc[key] = {};
        };
        return acc[key];
      };
      if (key === keys[keys.length - 1]) {
        acc[key] = value;
      }
      return (acc as any)[key];
    }, this.state);
    // console.log(`after`, this.state)
    this.state = this.state;
    return this;
  };
  suscribeDeep(keyDeep: string, callback: (value: any) => void, config: Partial<ConfigListener> = {}) {
    const keys = keyDeep.split(".");
    let statePrev: any;
    this.suscribe((state) => {
      const stateCurrent = keys.reduce((acc, key) => acc?.[key], state);
      if (statePrev !== stateCurrent) {
        statePrev = stateCurrent;
        callback(stateCurrent);
      };
    }, config);
    return this;
  };
  unsuscribeDeep(keyDeep: string, { id, callback }: { id?: string, callback?: (value: any) => void } = {}) {
    if (!id || !callback) throw new Error("id or callback is required");
    if (id) {
      this.unsuscribe(id);
    } else if (callback) {
      Object.keys(this._listeners).forEach((id) => {
        this._listeners[id] = this._listeners[id].filter((listener) => listener !== callback);
      });
    };
    return this;
  }

};
//* Por el momento suscribeDeep solo maneja tipos de datos primitivos, posteriormente se implementará para manejar objetos y arrays
/* const example = () => {
  const state = new StateNs<{ a: { b: { c: number } } }>({ a: { b: { c: 1 } } });
  state.suscribe((state) => {
    console.log(state);
  });
  state.suscribeDeep("a.b.c", (state) => {
    console.log(state);
  });
  state.state = { a: { b: { c: 2 } } };
  state.state = { a: { b: { c: 1 } } };
  //* deep 
  state.setDeep("a.b.c", 3);
};
example(); */
export default StateNs;