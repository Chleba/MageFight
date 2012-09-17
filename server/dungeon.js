
var WebSocketServer = require(__dirname+'/lib/websocket').server;

var http = require('http');
var server = http.createServer(function(req, res){
    response.writeHead(404);
    response.end();
});
server.listen(8003, function(){
    console.log('Posloucham na 8003 - MageFight');
});

function originIsAllowed(origin) {
  return true;
}

var wsServer = new WebSocketServer({
    httpServer : server,
    autoAcceptConnections : false
});

RPG = {};
RPG.SPELLS = {
    1 : {
        dmg : 10,
        block : 0
    },
    2 : {
        dmg : 5,
        block : 0
    },
    3 : {
        dmg : 0,
        block : 10
    }
}

var gameStatus = {
    preparing : 0,
    start : 1,
    play : 2,
    end : 3
};

var connections = [];
var players = [];
var rooms = []; 

var mageManager = {};
mageManager.getRoom = function(roomId){
    for(var i=0;i<rooms.length;i++){
        if(rooms[i].id == data.roomId){
            var room = rooms[i];
            return room;
            break;
        }
    }
};
mageManager.addPlayerIntoRoom = function(connection){
    var connected = false;
    for(var i=0;i<rooms.length;i++){
        var ppls = rooms[i].players;
        if(ppls.length < 2){
            var po = {
                name : '',
                id : 0,
                hp : 100,
                mana : 200,
                connection : connection
            };
            rooms[i].players.push(po);
            connected = true;
            mageManager.sendNewPlayer( rooms[i] );
            break;
        }
    }
    if(!connected){
        var room = {
            status : gameStatus.preparing,
            id : (new Date().getTime()),
            players : [{
                    name : '',
                    id : 0,
                    hp : 100,
                    mana : 200,
                    connection : connection
                }
            ],
            turnTime : 0,
            spells : [],
            turnTimeout : null
        };
        rooms.push(room);
    }
};
mageManager.setPlayersAttributes = function(data, connection){
    for(var i=0;i<rooms.length;i++){
        var room = rooms[i];
        if(room.id == data.roomId){
            for(var j=0;j<room.players.length;j++){
                var player = room.players[j];
                if(player.connection == connection){
                    player.name = data.name;
                    player.id = data.id;
                    break;
                }
            }
            break;
        }
    }

    var status = true;
    for(var i=0;i<room.players.length;i++){
        if(room.players[i].id === 0){
            status = false;
            break;
        }
    }
    if(!!status){
        mageManager.sendStartGame(room);
    }
};
mageManager.sendStartGame = function(room){
    var turnTime = mageManager._turnTime();

    room.turnTime = turnTime;

    var msgObj = {
        type : 'start',
        data : {
            gameStatus : gameStatus.start,
            players : [],
            turnTime : turnTime
        }
    };
    for(var i=0;i<room.players.length;i++){
        var player = room.players[i];
        var p = {};
        for(var j in player){
            if(j != 'connection'){
                p[j] = player[j];
            }
        }
        msgObj.data.players.push(p);
    }
    for(var i=0;i<room.players.length;i++){
        var player = room.players[i];
        player.connection.sendUTF( JSON.stringify(msgObj) );
    }
    mageManager._setTurnTimer(room);
};
mageManager.endTurn = function(room){
    console.log( room.players[0].id );
};
mageManager._setTurnTimer = function(room){
    var d = ( room.turnTime - new Date().getTime() );
    console.log(d);
    room.turnTimeout = setTimeout(mageManager.endTurn, d, room);
};
mageManager._turnTime = function(){
    var turnTime = 10 * 1000;
    var endTurn = new Date().getTime() + turnTime
    return endTurn;
};
mageManager.sendNewPlayer = function(room){
    var msgObj = {
        type : 'newPlayer',
        data : {
            room : room.id,
            gameStatus : gameStatus.preparing
        }
    };
    for(var i=0;i<room.players.length;i++){
        room.players[i].connection.sendUTF( JSON.stringify(msgObj) );
    }
};
mageManager.playerSpell = function(data, connection){
    var room = mageManager.getRoom(data.roomId);
};
mageManager.msgHandler = function(msg, connection){
    if(typeof(msg.utf8Data) == 'string'){
        var msg = JSON.parse(msg.utf8Data);
    }
    if(!!msg.type){
        switch(msg.type){
            case 'status':
                mageManager.setPlayersAttributes(msg.data, connection);
                break;
            case 'spell':
                mageManager.playerSpell(msg.data, connection);
                break;
            default : return; break;
        }
    }
};

/*- on server request -*/
wsServer.on('request', function(request) {
	if (!originIsAllowed(request.origin)) {
		request.reject();
		console.log((new Date()) + "Connection from origin " + request.origin + " rejected.");
		return;
	}

    var connection = request.accept(null, request.origin);
    connections.push(connection);

    mageManager.addPlayerIntoRoom(connection);
    
    /*- on message from connection -*/
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            
            mageManager.msgHandler(message, connection);

        } else if (message.type === 'binary') {
            console.log("Received Binary Message of " + message.binaryData.length + " bytes");
            connection.sendBytes(message.binaryData);
        }
    });
    
    /*- zavreni spojeni a odebrani ze zaspobniku -*/
    connection.on('close', function(reasonCode, description) {

        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
        if(connections.indexOf(this) > 0){
			connections.splice(connections.indexOf(this), 1);
		}

    });
});

