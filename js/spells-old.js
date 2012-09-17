
var MageFight = MageFight || {};
MageFight.Spells = {};

MageFight.Spells.FireBolt = JAK.ClassMaker.makeClass({
	NAME : 'MageFight.Spells.FireBolt',
	VERSION : '0.1',
	IMPLEMENT : JAK.ISignals
});

MageFight.Spells.FireBolt.prototype.$constructor = function(parent){
	this.fired = false;

	this.dmg = 10;

	this.parent = parent;

	this.distPos = this.parent.getDistPos();

	this.img = new Image();
	this.img.src = './img/fireball.png';

	this.canvas = this.parent.getCanvas();

	this.dom = {};
	this.ec = [];
	this.dom.root = JAK.gel(this.parent.dom.root);

	this.posX = this.distPos.from.x;
	this.posY = this.distPos.from.y;

	this.particles = [];
	this.pOpt = {
		posX : this.posX,
		posY : this.posY,
		gravity : 0,
		alpha : 1,
		size : 0.5,
		shrink : 0.96,
		life : 800,
		velX : 8,
		velY : 8,
		canvas : this.canvas,
		img : this.img
	};

	this._countAngle();

	this._makeHandler();
};

MageFight.Spells.FireBolt.prototype._countAngle = function(){
	var angle = Math.atan2( (this.distPos.to.y - this.posY), (this.distPos.to.x - this.posX) );
	
	//var speed = 5;
	var dist = Math.sqrt(((this.posX-this.distPos.to.x)*(this.posX-this.distPos.to.x))+((this.posY-this.distPos.to.y)*(this.posY-this.distPos.to.y)));
	var speed = dist/50;
	
	var a = this.posX + speed * Math.cos(angle);
    var b = this.posY + speed * Math.sin(angle);
    
    this.x = a - this.posX;
	this.y = b - this.posY;
};

MageFight.Spells.FireBolt.prototype._makeHandler = function(){
	this.dom.button = JAK.mel('div', { innerHTML : 'Firebolt' }, {
		border : '2px solid red', width : '50px', height : '50px', position : 'absolute', bottom : '0px', cursor:'pointer'
	});
	this.dom.root.appendChild(this.dom.button);
	this.ec.push( JAK.Events.addListener( this.dom.button, 'click', this, 'fire' ) );
};

MageFight.Spells.FireBolt.prototype._clearShot = function(){
	if(this.particles.length > 0){
		this.draw();
		return;
	}
	this.fired = false;
	this.particles = [];
	this.posX = this.distPos.from.x;
	this.posY = this.distPos.from.y;
};

MageFight.Spells.FireBolt.prototype.update = function(){
	if(!this.fired){ return; }

	this.posX += this.x;
	this.posY += this.y;
	
	if(this.posX >= this.distPos.to.x && this.posY >= this.distPos.to.y){
		this._clearShot();
		return;
	}

	this.pOpt.posX = this.posX;
	this.pOpt.posY = this.posY;
	this.particles.push(new Particle(this.pOpt));
};

MageFight.Spells.FireBolt.prototype.draw = function(){
	if(!this.fired){ return; }

	for(var i=0;i<this.particles.length;i++){
		var p = this.particles[i];
		if(p.opt === null){
			this.particles.splice(i, 1);
		} else {
			p.draw();
			p.update();
		}
	}
};

MageFight.Spells.FireBolt.prototype.fire = function(e, elm){
	this.makeEvent( 'spellFire', { spell : this } );
	if(this.parent.MANA < 10 || this.fired){
		return;
	}

	this.fired = true;

	this.parent.MANA -= 10;

	this.pOpt.posX = this.posX;
	this.pOpt.posY = this.posY;
	this.particles.push(new Particle(this.pOpt));
};