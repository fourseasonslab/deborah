"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DeborahMemoryIOEntry {
    constructor(data) {
        const uuidv4 = require('uuid/v4');
        //
        this.id = (data.id === undefined ? uuidv4() : data.id);
        this.text = data.text;
        this.sender = data.sender;
        this.date = new Date(data.date);
        this.action = data.action;
        this.context = data.context;
        this.driver = data.driver;
    }
    static createFromReceivedMesssage(data) {
        return new DeborahMemoryIOEntry({
            action: "receive",
            text: data.text,
            sender: data.senderName,
            date: new Date(),
            // context: data.context, //循環参照を避ける
            context: null,
            driver: data.driver.constructor.name,
        });
    }
}
class DeborahMemory {
    constructor(filename) {
        this.filename = filename;
        try {
            var fs = require("fs");
            var data = JSON.parse(fs.readFileSync(filename));
            this.journal = data.journal;
            console.log("Memory file loaded: " + this.filename);
            //this.logLatestEntries();
        }
        catch (e) {
            console.log("Memory file load failed: " + e);
        }
        if (this.journal === undefined)
            this.journal = [];
    }
    appendReceiveHistory(data) {
        this.journal.push(DeborahMemoryIOEntry.createFromReceivedMesssage(data));
        //this.logLatestEntries();
    }
    saveToFile(filename = this.filename) {
        var fs = require("fs");
        fs.writeFileSync(filename, JSON.stringify({
            journal: this.journal
        }));
        console.log("Memory saved to:" + this.filename);
        //this.logLatestEntries();
    }
    getRecentConversation(count, sender) {
        var list = [];
        for (var i = 0; i < this.journal.length; i++) {
            if (list.length >= count)
                break;
            if (this.journal[i].sender === sender) {
                list.push(this.journal[i]);
            }
        }
        return list;
    }
    getRecentConversationInContext(context, count = 10) {
        var list = [];
        for (var i = 0; i < this.journal.length; i++) {
            if (list.length >= count)
                break;
            if (this.journal[i].context === context) {
                list.push(this.journal[i]);
            }
        }
        return list;
    }
    logLatestEntries(count = 3) {
        console.log("Latest " + count + " journal entries:");
        console.log(JSON.stringify(this.journal.slice(-count), null, " "));
    }
}
exports.DeborahMemory = DeborahMemory;