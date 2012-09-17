/**
 * Simple canvas dungeon game with discreet shadow casting algorithm with many thanks to Ondrej Zara <ondra.zarovi.cz>
 * Made by cHLeB@ <chlebik@gmail.org>
 */
var MageFight = MageFight || {};

RPG = {};
RPG.MANA = 200;
RPG.HP = 100;

/*- min/max for array -*/
Array.prototype.min = function(){ return Math.min.apply(Math, this); };
Array.prototype.max = function(){ return Math.max.apply(Math, this); };

MageFight.Dungeon = JAK.ClassMaker.makeClass({
	NAME : 'MageFight.Dungeon',
	VERSION : '0.1',
	IMPLEMENT : JAK.ISignals
});

MageFight.Dungeon.prototype.$constructor = function(rootElm, socket, map){
	this.Stats = new Stats();
	this.Stats.getDomElement().style.position = 'absolute';
	this.Stats.getDomElement().style.left = '0px';
	this.Stats.getDomElement().style.top = '0px';
	document.body.appendChild( this.Stats.getDomElement() );

	this.HP = RPG.HP;
	this.MANA = RPG.MANA;

	this.dom = {};
	this.ec = [];
	this.sigs = [];
	// strely
	this.shots = [];
	// indikator pohybu
	this.move = false;

	this.socket = socket;

	this.timekeeper = JAK.Timekeeper.getInstance();
	this.cUtil = new cUtil(this.canvasMap);

	this.dom.root = JAK.gel(rootElm);

	this._makeCanvas();
	this._makeWizards();
	this._makeSpells();
	this._link();

	this._setTicker();
};

MageFight.Dungeon.prototype.$destructor = function(){
	JAK.Events.removeListeners(this.ec);
};

MageFight.Dungeon.prototype._handShake = function(){
	var msgObj = {
		type : 'status',
		data : MageFight.Player
	};
	this._sendSocketMessage(msgObj);
};

MageFight.Dungeon.prototype._makeCanvas = function(){
	this.dom.canvas = JAK.mel('canvas');
	this.canvasSize = { w : 750, h : 500 };
	this.dom.canvas.width = this.canvasSize.w;
	this.dom.canvas.height = this.canvasSize.h;

	this.dom.root.appendChild(this.dom.canvas);

	this.canvas = this.dom.canvas.getContext('2d');
};

MageFight.Dungeon.prototype._makeWizards = function(){
	this.wizards = [];
	// TODO udelani hracu po ziskani attributu ... kazdej na jedny strane
	this.distPos = { from : { x : 50, y : 250 }, to : { x : 700, y : 250 } };
	var pos = this.distPos.from;
	var wiz = new MageFight.Wizard(this, MageFight.Player, pos);
	this.wizards.push(wiz);
};

MageFight.Dungeon.prototype._makeEnemyWizard = function(data){
	this.distPos = { from : { x : 700, y : 250 }, to : { x : 50, y : 250 } };
	var pos = this.distPos.from;

	for(var i=0;i<data.players.length;i++){
		var p = data.players[i];
		if(p.id != MageFight.Player.id){
			var wiz = new MageFight.Wizard(this, p, pos, true);
			break;
		}
	}
	this.wizards.push(wiz);
};

MageFight.Dungeon.prototype.getDistPos = function(){
	return this.distPos;
};

MageFight.Dungeon.prototype.getCanvas = function(){
	return this.canvas;
};

MageFight.Dungeon.prototype._makeSpells = function(){
	var spell;
	this.spells = [];
	// firebolt
	spell = new MageFight.Spells.FireBolt(this);
	this.spells.push(spell);
	// lightning
	spell = new MageFight.Spells.Lightning(this);
	this.spells.push(spell);
	// shield
	spell = new MageFight.Spells.Shield(this);
	this.spells.push(spell);
};

MageFight.Dungeon.prototype._clearCanvas = function(){
	this.canvas.clearRect(0, 0, this.canvasSize.w, this.canvasSize.h);
};

MageFight.Dungeon.prototype._setTicker = function(){
	this.timekeeper.addListener(this, '_tick', 1);
};

MageFight.Dungeon.prototype._makeManaBar = function(){
	this.canvas.fillStyle = 'rgba(0, 0, 255, 0.3)';
	this.canvas.fillRect( 5, this.canvasSize.h-23, 100, 10 );
	this.canvas.fillStyle = 'rgba(0, 0, 255, 1)';/*-#00cc00-*/
	var hp = this.MANA/(RPG.MANA/100);
	this.canvas.fillRect( 5, this.canvasSize.h-23, hp, 10 );
};

MageFight.Dungeon.prototype._makeHPBar = function(){
	this.canvas.fillStyle = 'rgba(255, 0, 0, 0.3)';
	this.canvas.fillRect( 5, this.canvasSize.h-33, 100, 10 );
	this.canvas.fillStyle = 'rgba(255, 0, 0, 1)';/*-#00cc00-*/
	var hp = this.HP/(RPG.HP/100);
	this.canvas.fillRect( 5, this.canvasSize.h-33, hp, 10 );
};

MageFight.Dungeon.prototype._tick = function(){
	this._update();
	this._draw();
};

MageFight.Dungeon.prototype._updateSpells = function(){
	for(var i=0;i<this.spells.length;i++){
		this.spells[i].update();
	}
};

MageFight.Dungeon.prototype._drawSpells = function(){
	for(var i=0;i<this.spells.length;i++){
		this.spells[i].draw();
	}
};

MageFight.Dungeon.prototype._drawWizards = function(){
	for(var i=0;i<this.wizards.length;i++){
		this.wizards[i].draw();
	}
};

MageFight.Dungeon.prototype._update = function(){
	this._updateSpells();
};

MageFight.Dungeon.prototype._draw = function(){
	this.Stats.update();
	this._clearCanvas();
	
	this._makeManaBar();
	this._makeHPBar();

	this._drawSpells();
	this._drawWizards();
};

MageFight.Dungeon.prototype._sendSocketMessage = function(msg){
	if(typeof(msg) != 'string'){
		var msg = JSON.stringify(msg);
	}
	this.socket.send(msg);
};

MageFight.Dungeon.prototype._getSocketMessage = function(e){
	var msg = e.data.data;
	msg = typeof(msg) == 'string' ? JSON.parse(msg) : msg;

	console.log(msg);

	switch(msg.type){
		case 'newPlayer':
			MageFight.Player.roomId = msg.data.room;
			this._handShake();
			break;
		case 'start':
			this._makeEnemyWizard(msg.data);
			break;
		default : return; break;
	}
};

MageFight.Dungeon.prototype._fireSpell = function(e){
	/*-
	// animation change
	if(this.player.id == MageFight.Player.id){
		this._changeStatus(this.animations.spell, this._endSpellAnimation.bind(this));
	}
	-*/

	// spell action
	var spellId = 0;
	var spell = e.data.spell;
	if(spell instanceof MageFight.Spells.Shield){
		spellId = MageFight.Spells.Shield.id;
	} else if(spell instanceof MageFight.Spells.Lightning){
		spellId = MageFight.Spells.Lightning.id;
	} else if(spell instanceof MageFight.Spells.FireBolt){
		spellId = MageFight.Spells.FireBolt.id;
	}

	var msgObj = {
		type : 'spell',
		data : {
			roomId : MageFight.Player.roomId,
			spell : spellId
		}
	}
	this._sendSocketMessage(msgObj);
	// TODO disabledSpells
};

MageFight.Dungeon.prototype._link = function(){
	this.sigs.push( this.addListener('socketMessage', this._getSocketMessage.bind(this)) );
	this.addListener( 'spellFire', this._fireSpell.bind(this) );
};
