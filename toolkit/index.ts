import fnHandler from "./fnHandler";
export { fnHandler };
import initSockeIo from "./initSocketIo";
export { initSockeIo };
import newHandler from "./newHandler";
export { newHandler };
import initSocketEvents from "./initSocketEvents";
export { initSocketEvents };

const toolkit = {
  fnHandler,
  initSockeIo,
  newHandler,
  initSocketEvents,
};
export default toolkit;