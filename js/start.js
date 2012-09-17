
var MageFight = MageFight || {};

MageFight.Player = {
	name : '',
	id : JAK.idGenerator(),
	roomId : 0,
	HP : RPG.HP,
	mana : RPG.MANA
};

MageFight.StartScreen = JAK.ClassMaker.makeClass({
	NAME : 'MageFight.StartScreen',
	VERSION : '0.1',
	IMPLEMENT : JAK.ISignals
});

MageFight.StartScreen.prototype.$constructor = function(){
	this.ID = JAK.idGenerator();
	this.playerID = JAK.idGenerator();
	this.ec = [];
	this.dom = {};
	this.sigs = [];
	this._build();
	this._link();
};

MageFight.StartScreen.prototype.$destructor = function(){
	JAK.Events.removeListeners(this.ec);
};

MageFight.StartScreen.prototype._build = function(){
	this.dom.startRoot = JAK.mel('div', { width : '35%', className : 'startScreen' });
	this.dom.label = JAK.mel('label', { innerHTML : 'NickName:&nbsp;' });
	this.dom.nameInput = JAK.mel('input', {
		type : 'text',
		name : 'name',
		value : this.playerID
	});

	this.storage = function(){
		try {
			return window.localStorage;
		} catch (e) {
			return false;
		}
	}();

	if(this.storage){
		if(!!this.storage.getItem('playerName')){
			this.dom.nameInput.value = this.storage.playerName;
			MageFight.Player.name = this.dom.nameInput.value;
		}
	}

	this.dom.startButton = JAK.mel('input', {
		type : 'button',
		value : 'START'
	});
	this.ec.push( JAK.Events.addListener( this.dom.startButton, 'click', this, '_openSocket' ) );
	this.dom.startRoot.appendChild(this.dom.label)
	this.dom.startRoot.appendChild(this.dom.nameInput)
	this.dom.startRoot.appendChild(this.dom.startButton);
	document.body.appendChild(this.dom.startRoot);
};

MageFight.StartScreen.prototype._clear = function(){
	for(var node in this.dom){
		this.dom[node].parentNode.removeChild(this.dom[node]);
	}
};

MageFight.StartScreen.prototype._letTheGameBegin = function(){
	MageFight.Player.name = this.dom.nameInput.value;
	if(!!this.storage){
		this.storage.setItem('playerName', MageFight.Player.name);
	}
	this._clear();
	this.game = new MageFight.Dungeon('canvasMain', this.socket, {});
};

MageFight.StartScreen.prototype._openSocket = function(e, elm){
	this.socket = new MageFight.Socket(this.ID);
};

MageFight.StartScreen.prototype._socketOpen = function(e){
	this._letTheGameBegin();
};

MageFight.StartScreen.prototype._link = function(){
	this.sigs.push( this.addListener( 'socketOpen', this._socketOpen.bind(this) ) );
};

