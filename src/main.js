// Browser entry point.
import { Jc as ReactDOM, h } from "../runtime.js";
import { App } from "./App.js";

ReactDOM.createRoot(document.getElementById("root")).render(h(App, {}));
