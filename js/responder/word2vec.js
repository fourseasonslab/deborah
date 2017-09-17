"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responder_1 = require("../responder");
class DeborahResponderWord2Vec extends responder_1.DeborahResponder {
    constructor(bot) {
        super(bot);
        //
        this.w2v = null;
        this.name = "Word2Vec";
        var Word2Vec = require("node-word2vec");
        this.w2v = new Word2Vec(this.bot.settings.lib.word2vec.vectorPath);
    }
    ;
    generateResponse(req) {
        this.w2v.getVector(req.text, function (v1) {
            console.log(req.text + 'のべくとるは' + JSON.stringify(v1) + 'なんだって！');
        });
    }
}
exports.DeborahResponderWord2Vec = DeborahResponderWord2Vec;
