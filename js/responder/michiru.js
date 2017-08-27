"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responder_1 = require("../responder");
const slack_1 = require("../driver/slack");
function promiseCabocha(bot, text) {
    return new Promise((resolve) => {
        bot.cabochaf1.parse(text, resolve);
    });
}
var MichiruCodingTemplate;
(function (MichiruCodingTemplate) {
    MichiruCodingTemplate.C = [
        "#include <stdio.h>",
        "",
        "int main(int argc, char *argv[]){",
        "\t// HERE!!!!",
        "\treturn 0;",
        "}",
    ];
})(MichiruCodingTemplate || (MichiruCodingTemplate = {}));
var MichiruCodingOperationType;
(function (MichiruCodingOperationType) {
    MichiruCodingOperationType[MichiruCodingOperationType["Init"] = 0] = "Init";
    MichiruCodingOperationType[MichiruCodingOperationType["End"] = 1] = "End";
    MichiruCodingOperationType[MichiruCodingOperationType["InsertRow"] = 2] = "InsertRow";
    MichiruCodingOperationType[MichiruCodingOperationType["OverwriteRow"] = 3] = "OverwriteRow";
    MichiruCodingOperationType[MichiruCodingOperationType["DeleteRow"] = 4] = "DeleteRow";
})(MichiruCodingOperationType || (MichiruCodingOperationType = {}));
class MichiruCodingOperation {
    constructor(op) {
        this.line = -1;
        this.op = op;
    }
}
//http://d.hatena.ne.jp/favril/20090514/1242280476
String.prototype.isKanjiAt = function (index) {
    var u = this.charCodeAt(index);
    if ((0x4e00 <= u && u <= 0x9fcf) ||
        (0x3400 <= u && u <= 0x4dbf) ||
        (0x20000 <= u && u <= 0x2a6df) ||
        (0xf900 <= u && u <= 0xfadf) ||
        (0x2f800 <= u && u <= 0x2fa1f)) {
        return true;
    }
    return false;
};
class MichiruCoding {
    constructor(context) {
        this.instr = [];
        this.context = context;
    }
    process(req) {
        /*
            sample conversation:
            C言語書きたいなあ
            とりあえずputsを挿入して
            コンパイルして
            コンパイルして
            インデントくらい揃えてよ
            putsの第一引数を `"Hello, world"` にして
         */
        //console.log(JSON.stringify(req.analytics.words, null, " "));
        var match_init = req.wordMatch(["*", "C", "言語", "*", "書き", "たい", "*"]);
        var match_indent = req.wordMatch(["*", "インデント", "*", "揃え", "*"]);
        var match_compile = req.wordMatch(["*", "コンパイル", "*"]);
        var match_insert = req.wordMatch(["*", ".", "挿入", "*"]);
        var match_replace_args = req.wordMatch(["*", "の", "*", "引数", "*", "に", "し", "て", "*"]);
        var match_codeblock = req.text.match(/`.*?`/g);
        if (match_init) {
            if (this.currentCode === undefined) {
                this.currentCode = MichiruCodingTemplate.C.concat();
                this.currentLine = 4;
            }
            else {
                req.driver.reply(req, "今やってる途中だよ？覚えてる？");
            }
            this.uploadCode(req);
            req.driver.reply(req, "ここからどうすればいい？");
        }
        else if (match_indent) {
            if (!this.currentCode) {
                req.driver.reply(req, "まだソースコードがないよ!");
                return;
            }
            const uuidv4 = require('uuid/v4');
            var tmpFileName = "./tmp/" + uuidv4() + ".c";
            const fs = require('fs');
            fs.writeFileSync(tmpFileName, this.getCurrentCodeStr());
            const { exec } = require('child_process');
            exec('clang-format ' + tmpFileName, (error, stdout, stderr) => {
                if (error) {
                    return;
                }
                this.currentCode = stdout.split('\n');
                this.uploadCode(req);
                req.driver.reply(req, "インデントしたよ〜");
            });
        }
        else if (match_compile) {
            if (!this.currentCode) {
                req.driver.reply(req, "まだソースコードがないよ!");
                return;
            }
            const uuidv4 = require('uuid/v4');
            var tmpFileName = "./tmp/" + uuidv4() + ".c";
            const fs = require('fs');
            fs.writeFileSync(tmpFileName, this.getCurrentCodeStr());
            const { exec } = require('child_process');
            exec('gcc -Wall -Wpedantic -fsyntax-only ' + tmpFileName, (error, stdout, stderr) => {
                if (error) {
                    return;
                }
                req.driver.reply(req, "こんな感じ\n```\n" + stderr + "\n```");
            });
        }
        else if (match_insert) {
            if (!this.currentCode) {
                req.driver.reply(req, "まだソースコードがないよ!");
                return;
            }
            var elemName = match_insert[0].slice(-1)[0][0];
            if (elemName === "puts") {
                this.currentCode.splice(this.currentLine - 1, 0, "puts(\"\");");
                this.uploadCode(req);
            }
            else {
                req.driver.reply(req, "よくわからない…。");
            }
        }
        else if (match_replace_args) {
            console.log(JSON.stringify(this.currentCode, null, " "));
            var target = match_replace_args[0].slice(-1)[0][0];
            var info = {
                target: target,
                line: parseInt(this.findTargetLineListInCode(target)[0]),
                argIndex: this.getIndexFromWords(match_replace_args[2]),
                replace: match_codeblock,
            };
            req.driver.reply(req, "replace: " + JSON.stringify(info, null, " "));
            var err;
            if (err = this.replaceArgument(info.line, info.argIndex, info.replace[0])) {
                req.driver.reply(req, err);
            }
            else {
                this.uploadCode(req);
            }
        }
        else {
            req.driver.reply(req, "ちょっとわからない :pray:");
        }
    }
    uploadCode(replyTo) {
        if (replyTo.driver instanceof slack_1.DeborahDriverSlack) {
            var sd = replyTo.driver;
            sd.uploadSnippet(replyTo.context, "test.c", this.getCurrentCodeStr(), "c");
        }
        else {
            console.error("Driver is not Slack.");
        }
    }
    getCurrentCodeStr() {
        return this.currentCode.join("\n");
    }
    setCurrentCode(str) {
        this.currentCode = str.split("\n");
    }
    getIndexFromWords(words) {
        var index = -1;
        for (var k of words) {
            console.log(k.join("\t"));
            if (k[2] === "数") {
                if (k[0].isKanjiAt(0)) {
                    index = this.getNumberInKanji(k[0]);
                    console.log("kanji num: " + index);
                }
                else {
                    index = parseInt(k[0]);
                    console.log("alphabet num: " + index);
                }
            }
        }
        return index;
    }
    getNumberInKanji(kanjiStr) {
        var table = ['', '一', '二', '三', '四', '五'];
        return table.indexOf(kanjiStr[0]);
    }
    findTargetLineListInCode(target) {
        var list = [];
        for (var i in this.currentCode) {
            if (this.currentCode[i].indexOf(target) !== -1) {
                list.push(parseInt(i) + 1);
            }
        }
        console.log("findTargetLineListInCode: " + list);
        return list;
    }
    convertLineToAST(lineStr) {
        var line = lineStr.split("").reverse();
        var inStrLiteral = function () {
            var list = ['"'];
            var part = "";
            var c;
            while ((c = line.pop()) !== undefined) {
                if (c === '"') {
                    list.push(part);
                    break;
                }
                part += c;
            }
            return list;
        };
        var inArg = function () {
            var list = ['('];
            var part = "";
            var c;
            while ((c = line.pop()) !== undefined) {
                if (c === '"') {
                    if (part.length)
                        list.push(part);
                    list.push(inStrLiteral());
                    part = "";
                    continue;
                }
                if (c === ')' || c === ',') {
                    list.push(part);
                    list.push(c);
                    part = "";
                    if (c === ')')
                        break;
                    continue;
                }
                part += c;
            }
            return list;
        };
        var f = function () {
            var list = [];
            var part = "";
            var c;
            while ((c = line.pop()) !== undefined) {
                if (c === '(') {
                    list.push(part);
                    list.push(inArg());
                    part = "";
                    continue;
                }
                part += c;
            }
            list.push(part);
            return list;
        };
        var ast = f();
        console.log(JSON.stringify(ast, null, " "));
        return ast;
    }
    replaceArgument(line, index, replace) {
        var lineIndex = line - 1;
        if (lineIndex < 0 || this.currentCode.length <= lineIndex) {
            return line + "行目なんてありません！";
        }
        var ast = this.convertLineToAST(this.currentCode[lineIndex]);
        console.log(JSON.stringify(ast, null, " "));
        var args = ast[1];
        if (index < 1 || args.length - 1 < index) {
            return index + "個目の引数なんてありません！";
        }
        args[index] = replace.substring(1, replace.length - 1);
        const flatten = require('flatten');
        this.currentCode[lineIndex] = flatten(ast).join("");
        return undefined;
    }
}
class DeborahResponderMichiru extends responder_1.DeborahResponder {
    constructor(bot) {
        super(bot);
        this.name = "michiru";
        this.yomiDict = [
            "リンゴ",
            "ゴリラ",
            "ラッパ",
            "パイナップル",
            "ルーマニア",
            "アフリカ",
            "カナダ",
            "ダルマ",
            "ラクダ",
            "サクラ"
        ];
        this.codingManager = new MichiruCoding();
    }
    generateResponse(req) {
        this.codingManager.process(req);
        /*
        if(req.analytics.words.length !== 1){
            req.driver.reply(req, "それは単語じゃないよー");
            return 0;
        }
        var yomi = req.analytics.words[0][8];
        var first = yomi[yomi.length - 1];
        req.driver.reply(req,"次は" + this.getNextYomiWord(first));
         */
    }
    getNextYomiWord(first) {
        for (var i = 0; i < this.yomiDict.length; i++) {
            if (this.yomiDict[i][0] === first)
                return this.yomiDict[i];
        }
        return null;
    }
}
exports.DeborahResponderMichiru = DeborahResponderMichiru;
