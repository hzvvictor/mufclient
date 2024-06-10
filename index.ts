import Class from "./class";
import toolkit from "./toolkit";
import components from "./components";
const MUFCLIENT: {
  Class: typeof Class;
  toolkit: typeof toolkit;
  components: typeof components;
} = {
  Class,
  toolkit,
  components,
};
export { Class, toolkit, components };
export default MUFCLIENT;