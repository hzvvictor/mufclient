import fnHandler from "./fnHandler";
export { fnHandler };
import initSockeIo from "./initSocketIo";
export { initSockeIo };
import newHandler from "./newHandler";
export { newHandler };
import initSocketEvents from "./initSocketEvents";
export { initSocketEvents };
import * as EventsSocket from "./EventsSocket";
export { EventsSocket };

const toolkit = {
  fnHandler,
  initSockeIo,
  newHandler,
  initSocketEvents,
  EventsSocket,
};
export default toolkit;