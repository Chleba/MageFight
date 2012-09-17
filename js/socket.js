var MageFight = MageFight || {};

MageFight.Socket = JAK.ClassMaker.makeClass({
	NAME : 'MageFight.Socket',
	VERSION : '1.0',
	IMPLEMENT : JAK.ISignals
});

MageFight.Socket.prototype.$constructor = function(id){
	this.dom = {};
	this.ec = [];

	this.active = false;
	this.id = id;

	//this.serverUrl = 'ws://localhost:8003';
	this.serverUrl = 'ws://chleba.org:8003';

	this.msgObj = {
		playerID : this.id,
		hp : 0,
		mana : 0,
		activeSpell : null
	};

	this.socket = this._makeSocket();

	this._link();
};

MageFight.Socket.prototype.setCallback = function(method){
	this.callback = method;
};

MageFight.Socket.prototype._makeSocket = function(){
	var  socket;
	if(window['MozWebSocket']){
		socket = new MozWebSocket(this.serverUrl);
	} else {
		socket = new WebSocket(this.serverUrl);
	}
	return socket;
};

MageFight.Socket.prototype._socketError = function(e, elm){
	this.active = false;
	throw new Error('Socket Error');
};

MageFight.Socket.prototype._socketClose = function(e, elm){
	this.active = false;
};

MageFight.Socket.prototype._socketOpen = function(e, elm){
	this.active = true;
	this.makeEvent('socketOpen', {});
};

MageFight.Socket.prototype._socketMessage = function(e){
	this.makeEvent('socketMessage', { data : e.data });
};

MageFight.Socket.prototype.send = function(msg){
	var msg = msg || this.msgObj;
	if(typeof(msg) != 'string'){
		var msg = JSON.stringify(msg);
	}
	this.socket.send( msg );
};

MageFight.Socket.prototype._link = function(){
	this.ec.push( JAK.Events.addListener( this.socket, 'error', this, '_socketError' ) );
	this.ec.push( JAK.Events.addListener( this.socket, 'error', this, '_socketClose' ) );
	this.ec.push( JAK.Events.addListener( this.socket, 'open', this, '_socketOpen' ) );
	this.ec.push( JAK.Events.addListener( this.socket, 'message', this, '_socketMessage' ) );
};
