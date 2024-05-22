import "Support/remote";

import { createRoot } from "react-dom/client";

import { forceVal } from "Support/nullable";

import App from "App";

(window as any).App = App;

const domNode = forceVal(document.body.querySelector("#app-container"));

const root = createRoot(domNode);

root.render(<App />);
