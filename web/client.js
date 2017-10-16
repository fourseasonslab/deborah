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

    onReply(f){
        this.socket.on('reply', f);
    }

    onResult(f){
        this.recognition.onresult = f;
    }

    toggleRecog() {
		if (recording) {
			recognition.stop();
			this.recording = false;
		} else {
			recognition.lang = "ja-JP";
			recognition.start();
			this.recording = true;
        }
        return this.recording;
    }
    
    submitInput(text){
        var postData = {
			text: text
		};
		this.socket.emit("input", postData);
    }
}
