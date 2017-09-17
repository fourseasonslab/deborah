"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DeborahResponder {
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
exports.DeborahResponder = DeborahResponder;
