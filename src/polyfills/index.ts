if (typeof BigInt === "undefined") global.BigInt = require("big-integer");
global.Buffer = require("buffer").Buffer;

/*
 * Import atob polyfill since react native does not support it
 * @see https://github.com/auth0/jwt-decode#polyfilling-atob
 */
import "core-js/stable/atob";
