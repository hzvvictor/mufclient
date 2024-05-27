import Class from "./class";
import toolkit from "./toolkit";
const MUFCLIENT: {
  Class: typeof Class;
  toolkit: typeof toolkit;
} = {
  Class,
  toolkit,
};
export { Class , toolkit};
export default MUFCLIENT;