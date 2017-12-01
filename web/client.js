class DeborahClient {
    constructor(){

        // Socket.io
        this.socket = io.connect(location.protocol + '//' + location.host);
        this.socket.on('connect', function(){
            console.log("sock: connect");
        });
        this.socket.on('event', function(data){
            console.log("sock: event");
            console.log(data);
        });
        this.socket.on('disconnect', function(){
            console.log("sock: disconnected");
        });

        // Speech Recognition
        if (!('webkitSpeechRecognition' in window)){
            console.log("webkitSpeechRecognition not found");
            // log("webkitSpeechRecognition not found");
            return;
        }
        console.log("webkitSpeechRecognition found");
        // log("webkitSpeechRecognition found");
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recording = false;

        this.recognition.onstart = function(){
            console.log("Recog begin.");
            // log("Recog Begin");
        };
    
        this.recognition.onend = function(){
            console.log("Recog end.");
            // log("Recog End");
        };
    
        this.recognition.onspeechstart = function(){
            console.log("sp begin.");
        };
    
        this.recognition.onspeechend = function(){
            console.log("sp end"); 
        };
    
        this.recognition.onnomatch = function(){
            console.log("no match"); 
        };
    
        this.recognition.onerror = function(){
            console.log("error"); 
        };
    }

    onSocketReply(f){
        this.socket.on('reply', f);
    }

    onRecogResult(f){
        this.recognition.onresult = f;
    }

    toggleRecog() {
		if (this.recording) {
			this.recognition.stop();
			this.recording = false;
		} else {
			this.recognition.lang = "ja-JP";
			this.recognition.start();
			this.recording = true;
        }
        return this.recording;
    }
    
    sendMessage(text){
        var postData = {
			type: 'unknown',
			confidence: 1,
			text: text
		};
		this.socket.emit("input", postData);
    }

    sendMessageProper(type, confidence, text){
        var postData = {
			type: type,
			confidence: confidence,
			text: text
		};
		this.socket.emit("input", postData);
    }
}
