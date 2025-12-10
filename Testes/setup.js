// Testes/setup.js
import { TextEncoder, TextDecoder } from "util";
import fetch from "cross-fetch";

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.fetch = fetch;