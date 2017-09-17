"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DeborahResponderEcho {
    constructor(bot) {
        this.bot = bot;
        this.name = "Echo";
    }
    generateResponse(req) {
        // echo
        req.driver.reply(req, req.text);
    }
    reply(req, text) {
        req.driver.reply(req, text);
    }
}
exports.DeborahResponderEcho = DeborahResponderEcho;
