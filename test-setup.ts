import { Window } from "happy-dom";

const window = new Window();
const document = window.document;

global.window = window as any;
global.document = document as any;
global.HTMLElement = window.HTMLElement as any;
global.HTMLDivElement = window.HTMLDivElement as any;
global.HTMLButtonElement = window.HTMLButtonElement as any;
