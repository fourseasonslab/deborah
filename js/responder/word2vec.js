"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responder_1 = require("../responder");
const node_word2vec_1 = require("node-word2vec");
class DeborahResponderWord2Vec extends responder_1.DeborahResponder {
    constructor(bot) {
        super(bot);
        //
        this.w2v = null;
        this.name = "Word2Vec";
        this.w2v = new node_word2vec_1.Word2Vec(this.bot.settings.lib.word2vec.vectorPath);
    }
    ;
    generateResponse(req) {
        this.w2v.getVector(req.text, function (v1) {
            console.log(req.text + 'のべくとるは' + JSON.stringify(v1) + 'なんだって！');
        });
    }
}
exports.DeborahResponderWord2Vec = DeborahResponderWord2Vec;
