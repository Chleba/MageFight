
var MageFight = MageFight || {};

MageFight.Spells = JAK.ClassMaker.makeClass({
	NAME : 'MageFight.Spells',
	VERSION : '0.1',
	IMPLEMENT : JAK.ISignals
});

MageFight.Spells.prototype.$constructor = function(parent){
	this.fired = false;
	this.dmg = 10;
	this.parent = parent;
	
	this.canvas = this.parent.getCanvas();

	this.dom = {};
	this.ec = [];
	this.dom.root = JAK.gel(this.parent.dom.root);
};

MageFight.Spells.prototype._countAngle = function(){
	var angle = Math.atan2( (this.distPos.to.y - this.posY), (this.distPos.to.x - this.posX) );
	
	//var speed = 5;
	this.dist = Math.sqrt(((this.posX-this.distPos.to.x)*(this.posX-this.distPos.to.x))+((this.posY-this.distPos.to.y)*(this.posY-this.distPos.to.y)));
	var speed = this.dist/50;
	
	var a = this.posX + speed * Math.cos(angle);
    var b = this.posY + speed * Math.sin(angle);
    
    this.x = a - this.posX;
	this.y = b - this.posY;
};

MageFight.Spells.prototype._makeHandler = function(name){
	name = name || 'Spell'
	this.dom.button = JAK.mel('div', { className : 'spellButton', innerHTML : name }, {
		border : '2px solid red', width : '50px', height : '50px', cursor:'pointer'
	});
	this.dom.root.appendChild(this.dom.button);
	this.ec.push( JAK.Events.addListener( this.dom.button, 'click', this, 'fire' ) );
};

MageFight.Spells.prototype.update = function(){

};

MageFight.Spells.prototype.draw = function(){
	
};

MageFight.Spells.prototype.fire = function(e, elm){
	
};