import { io } from "socket.io-client";

export interface InitSocketIo {
  url: string;
  path: string;
  token: string | object;
}
;
const initSockeIo = ({ url, path, token }: InitSocketIo) => {
  if (token && typeof token == "object") token = JSON.stringify(token);
  console.log(`\n\t🚀 [Socket]: init into -> '${url}'`);
  const instance = io(url, {
    path,
    timeout: 1000 * 60 * 60,
    autoConnect: true,
    reconnectionDelay: 1000,
    // secure: true,
    transports: ["websocket", "polling"],
    auth: { token },
  });
  return instance;
};

export default initSockeIo;