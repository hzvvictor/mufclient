import React, { useEffect, useState, useReducer, useCallback } from "react";
import { reducer } from "./reducer";
import { ModalProps, initialState, actions, Listeners } from "./interface";

const popupConfig: ModalProps = {
  isOpen: false,
  children: null,
  isCloseVisible: true,
  isOutsideClose: true,
  sxContainer: {},
  sxModal: {},
  sxButtonClose: {},
  sxHeaderTitle: {},
  title: '',
  zIndex: 2000,
};
export const setPopupDefaults = (props: ModalProps) => {
  Object.keys(props).forEach((key: any) => {
    (popupConfig as any)[key] = (props as any)[key];
  });
};
const usePopup = ({
  isOpen: isOpenProp = popupConfig.isOpen,
  children: childrenProp = popupConfig.children,
  isCloseVisible: isCloseVisibleProp = popupConfig.isCloseVisible!,
  isOutsideClose: isOutsideCloseProp = popupConfig.isOutsideClose!,
  sxContainer = popupConfig.sxContainer || {},
  sxModal = popupConfig.sxModal || {},
  sxButtonClose = popupConfig.sxButtonClose || {},
  sxHeaderTitle = popupConfig.sxHeaderTitle || {},
  title = popupConfig.title,
  zIndex = popupConfig.zIndex!,
}: ModalProps) => {
  const [isOpen, setIsOpen] = useState(isOpenProp);
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    children: childrenProp,
    isCloseVisible: isCloseVisibleProp,
    isOutsideClose: isOutsideCloseProp,
    sxContainer,
    sxModal,
    sxButtonClose,
    sxHeaderTitle,
    title,
    zIndex,
  });

  useEffect(() => {
    dispatch({ type: actions.isRenderer, payload: true });
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      listeners.onOpen.forEach(listener => listener.callback());
    } else {
      document.body.style.overflow = 'auto';
      listeners.onClose.forEach(listener => listener.callback());
    }
  }, [isOpen]);

  const [listeners, setListeners] = useState<Listeners>({
    onOpen: [],
    onClose: [],
  });

  const onOpen = (id: string, callback: () => void) => {
    if (!id) throw new Error('El id es requerido');
    setListeners(prev => {
      const isIdExist = prev.onOpen.find(listener => listener.id === id);
      if (isIdExist) return prev;
      return {
        ...prev,
        onOpen: [...prev.onOpen, { id, callback }],
      };
    });
  };

  const removeOpenListener = (id: string) => {
    if (!id) throw new Error('El id es requerido');
    setListeners(prev => ({
      ...prev,
      onOpen: prev.onOpen.filter(listener => listener.id !== id),
    }));
  };

  const removeCloseListener = (id: string) => {
    if (!id) throw new Error('El id es requerido');
    setListeners(prev => ({
      ...prev,
      onClose: prev.onClose.filter(listener => listener.id !== id),
    }));
  };

  const onClose = (id: string, callback: () => void) => {
    if (!id) throw new Error('El id es requerido');
    setListeners(prev => {
      const isIdExist = prev.onClose.find(listener => listener.id === id);
      if (isIdExist) return prev;
      return {
        ...prev,
        onClose: [...prev.onClose, { id, callback }],
      };
    });
  };

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  /* const off = {
    open: removeOpenListener,
    close: removeCloseListener,
  } */
  const off = useCallback(
    (type: 'open' | 'close', id: string) => {
      if (type === 'open') {
        removeOpenListener(id);
      } else {
        removeCloseListener(id);
      }
    },
    []
  );

  return {
    get isOpen() {
      return isOpen;
    },
    set isOpen(isOpen: boolean) {
      setIsOpen(isOpen);
    },
    open,
    close,
    onOpen,
    onClose,
    off,
    set: (payload: Partial<ModalProps>) => {
      for (const key in payload) {
        const action = (actions as any)[key];
        if (action) {
          dispatch({ type: action, payload: (payload as any)[key] });
        }
      }
    },
    get children() {
      return state.children;
    },
    set children(children: React.ReactNode) {
      dispatch({ type: actions.children, payload: children });
    },
    get isCloseVisible() {
      return state.isCloseVisible;
    },
    set isCloseVisible(isCloseVisible: boolean) {
      dispatch({ type: actions.isCloseVisible, payload: isCloseVisible });
    },
    get isOutsideClose() {
      return state.isOutsideClose;
    },
    set isOutsideClose(isOutsideClose: boolean) {
      dispatch({ type: actions.isOutsideClose, payload: isOutsideClose });
    },
    get sxContainer() {
      return state.sxContainer;
    },
    set sxContainer(sxContainer: React.CSSProperties) {
      dispatch({ type: actions.sxContainer, payload: sxContainer });
    },
    get sxModal() {
      return state.sxModal;
    },
    set sxModal(sxModal: React.CSSProperties) {
      dispatch({ type: actions.sxModal, payload: sxModal });
    },
    get sxButtonClose() {
      return state.sxButtonClose;
    },
    set sxButtonClose(sxButtonClose: React.CSSProperties) {
      dispatch({ type: actions.sxButtonClose, payload: sxButtonClose });
    },
    get sxHeaderTitle() {
      return state.sxHeaderTitle;
    },
    set sxHeaderTitle(sxHeaderTitle: React.CSSProperties) {
      dispatch({ type: actions.sxHeaderTitle, payload: sxHeaderTitle });
    },
    get title() {
      return state.title;
    },
    set title(title: string | React.ReactNode | null) {
      dispatch({ type: actions.title, payload: title });
    },
    get zIndex() {
      return state.zIndex;
    },
    set zIndex(zIndex: number) {
      dispatch({ type: actions.zIndex, payload: zIndex });
    },
  };
};

export default usePopup;