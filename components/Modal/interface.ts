
import React, { FC } from "react";

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
    payload: string | React.ReactNode | null;
  };
  zIndex: {
    type: 'SET_Z_INDEX';
    payload: number;
  };
}

export type ModalState = {
  [key in keyof ModalConfig]: ModalConfig[key]['payload'];
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
  zIndex: 2000,
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
  zIndex: 'SET_Z_INDEX',
};
/* const types = Object.entries(actions).reduce(
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {},
) as { [value in ActionsType[keyof ActionsType]]: string }; */

export type HandlerAction<K extends keyof ModalConfig> = (
  state: ModalState,
  action: ModalConfig[K],
) => ModalState;

export type HandlerActions = {
  [key in ActionsTypeValues[keyof ActionsTypeValues]]: HandlerAction<
    keyof ModalConfig
  >;
};
export const actionHandlers: HandlerActions = Object.entries(actions).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [value]: (state: any, action: any) => ({
      ...state,
      [key]: action.payload,
    }),
  }),
  {},
) as unknown as HandlerActions;

// actionHandlers.SET_TITLE = (state, action) => ({
//   ...state,
//   title: action.payload as any,
// });