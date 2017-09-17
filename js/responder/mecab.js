"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responder_1 = require("../responder");
class DeborahResponderMeCab extends responder_1.DeborahResponder {
    constructor(bot) {
        super(bot);
        this.name = "MeCab";
    }
    generateResponse(req) {
        this.bot.mecab.parse(req.text, function (err, result) {
            console.log(JSON.stringify(result, null, 2));
            var s = "";
            for (var i = 0; i < result.length - 1; i++) {
                if (result[i][1] === "動詞") {
                    s = result[i][0];
                    if (result[i][6] !== "基本形") {
                        for (i++; i < result.length - 1; i++) {
                            s += result[i][0];
                            if (result[i][6] === "基本形")
                                break;
                        }
                    }
                    //console.log(s);
                }
            }
            if (s.length > 0) {
                req.driver.reply(req, "そうか、君は" + s + "フレンズなんだね！");
            }
        });
    }
}
exports.DeborahResponderMeCab = DeborahResponderMeCab;
