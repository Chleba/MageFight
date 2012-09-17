
var MageFight = MageFight || {};

MageFight.Spells.FireBolt = JAK.ClassMaker.makeClass({
	NAME : 'MageFight.Spells.FireBolt',
	VERSION : '0.1',
	IMPLEMENT : JAK.ISignals,
	EXTEND : MageFight.Spells
});

MageFight.Spells.FireBolt.id = 1;

MageFight.Spells.FireBolt.prototype.$constructor = function(parent){
	this.$super(parent);
	
	this.dmg = 10;
	this.mana = 10;
	this.distPos = this.parent.getDistPos();

	this.img = new Image();
	this.img.src = './img/fireball.png';

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

	this._makeHandler('FireBolt');
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
	this.$super();
	if(this.parent.MANA < this.mana || this.fired){
		return;
	}
	this.makeEvent( 'spellFire', { spell : this } );

	this.fired = true;

	this.parent.MANA -= this.mana;

	this.pOpt.posX = this.posX;
	this.pOpt.posY = this.posY;
	this.particles.push(new Particle(this.pOpt));
};