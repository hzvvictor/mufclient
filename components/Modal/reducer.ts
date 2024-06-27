import { ModalState, ModalConfig, actionHandlers } from "./interface";

// actionHandlers.children
/* export const reducer = (
  state: ModalState,
  action: ModalConfig[keyof ModalConfig],
  key: keyof ModalState
): ModalState => {
  const handler = actionHandlers[action.type];
  if (handler) {
    const newValuesPartial = handler(state, action);
    return { ...state, [key]: newValuesPartial[key] };
  }
  throw new Error(`Unknown action type: ${action.type}`);
}; */
export const reducer = (state: ModalState, action: ModalConfig[keyof ModalConfig]): ModalState => {
  const handler = actionHandlers[action.type];
  if (handler) {
    const newValuesPartial = handler(state, action);
    return { ...state, ...newValuesPartial };
  }
  throw new Error(`Unknown action type: ${action.type}`);
};
