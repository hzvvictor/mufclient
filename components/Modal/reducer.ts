import { ModalState, ModalConfig, actionHandlers } from "./interface";

// actionHandlers.children
export const reducer = (
  state: ModalState,
  action: ModalConfig[keyof ModalConfig]
): ModalState => {
  const handler = actionHandlers[action.type];
  if (handler) {
    return handler(state, action);
  }
  throw new Error(`Unknown action type: ${action.type}`);
};
