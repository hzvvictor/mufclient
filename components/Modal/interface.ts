
import React from "react";

export interface ModalConfig {
  children: {
    type: 'SET_CHILDREN',
    payload: React.ReactNode | null;
  };
  isRenderer: {
    type: 'SET_RENDERER';
    payload: boolean;
  };
  isCloseVisible: {
    type: 'SET_CLOSE_VISIBLE';
    payload: boolean;
  };
  isOutsideClose: {
    type: 'SET_OUTSIDE_CLOSE';
    payload: boolean;
  };
  sxContainer: {
    type: 'SET_SX_CONTAINER';
    payload: React.CSSProperties;
  };
  sxModal: {
    type: 'SET_SX_MODAL';
    payload: React.CSSProperties;
  };
  sxButtonClose: {
    type: 'SET_SX_BUTTON_CLOSE';
    payload: React.CSSProperties;
  };
  sxHeaderTitle: {
    type: 'SET_SX_HEADER_TITLE';
    payload: React.CSSProperties;
  };
  title: {
    type: 'SET_TITLE';
    payload: string;
  };
}

export type ModalState = {
  [key in keyof ModalConfig]: ModalConfig[key] extends { type: string }
  ? ModalConfig[key]["payload"]
  : never;
}
// export type ModalState = StateBase;

export interface ModalProps extends Partial<ModalState> {
  isOpen: boolean;
}

interface Listener {
  id: string;
  callback: () => void;
}

export interface Listeners {
  onOpen: Listener[];
  onClose: Listener[];
}

export const initialState: ModalState = {
  children: null,
  isRenderer: false,
  isCloseVisible: true,
  isOutsideClose: true,
  sxContainer: {},
  sxModal: {},
  sxButtonClose: {},
  sxHeaderTitle: {},
  title: '',
};

type ActionsTypeValues = {
  [key in keyof ModalConfig]: ModalConfig[key]['type'];
};
export const actions: ActionsTypeValues = {
  children: 'SET_CHILDREN',
  isRenderer: 'SET_RENDERER',
  isCloseVisible: 'SET_CLOSE_VISIBLE',
  isOutsideClose: 'SET_OUTSIDE_CLOSE',
  sxContainer: 'SET_SX_CONTAINER',
  sxModal: 'SET_SX_MODAL',
  sxButtonClose: 'SET_SX_BUTTON_CLOSE',
  sxHeaderTitle: 'SET_SX_HEADER_TITLE',
  title: 'SET_TITLE',
};
/* const types = Object.entries(actions).reduce(
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {},
) as { [value in ActionsType[keyof ActionsType]]: string }; */

type HandlerAction<K extends keyof ModalConfig> = (
  state: ModalState,
  action: ModalConfig[K],
) => ModalState;

type HandlerActions = {
  [key in keyof ModalConfig]: HandlerAction<key>;
};
export const actionHandlers: HandlerActions = Object.entries(actions).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [value]: (state, action) => ({
      ...state,
      [key]: action.payload,
    }),
  }),
  {},
) as unknown as HandlerActions;