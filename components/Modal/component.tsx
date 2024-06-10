import { createPortal } from "react-dom";
import classNames from "classnames";
import React from "react";
import usePopup from "./usePopup";
import "./styles.css";

interface PopupProps {
  modal: ReturnType<typeof usePopup>;
  children?: React.ReactNode;
}

const Popup: React.FC<PopupProps> = ({ modal, children }) => {
  if (!modal.isOpen) return null;

  return createPortal(
    <div
      style={modal.sxContainer}
      onClick={() => modal.isOutsideClose && modal.close()}
      className={classNames("mufclient_modal__container")}
    >
      <div
        style={modal.sxModal}
        className={classNames("mufclient_modal__modal")}
      >
        <div className={"mufclient_modal__header"}>
          <span style={modal.sxHeaderTitle}>
            {modal.title}
          </span>
          {modal.isCloseVisible && (
            <button
              style={modal.sxButtonClose}
              className="mufclient_modal__close-button"
              onClick={modal.close}
            >
              &#10005; {/* X */}
            </button>
          )}
        </div>
        {modal.children || children}
      </div>
    </div>,
    document.body
  );
};

export default Popup;
