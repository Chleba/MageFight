
var MageFight = MageFight || {};

MageFight.Spells.Lightning = JAK.ClassMaker.makeClass({
	NAME : 'MageFight.Spells.Lightning',
	VERSION : '0.1',
	IMPLEMENT : JAK.ISignals,
	EXTEND : MageFight.Spells
});

MageFight.Spells.Lightning.id = 2;

MageFight.Spells.Lightning.prototype.$constructor = function(parent){
	this.$super(parent);
	
	this.dmg = 15;
	this.mana = 15;
	this.distPos = this.parent.getDistPos();

	this.posX = this.distPos.from.x;
	this.posY = this.distPos.from.y;

	this.Lopt = {
	    lwidth : 2,
	    part : 8,
	    color : '#0000cc',
	    lastDist : 10,
	    angle : 0.8,
	    time : 1
	};

	this._countAngle();

	this._makeHandler('Lightning');
};

MageFight.Spells.Lightning.prototype._makeLine = function(f, t){
	this.canvas.save();
	this.canvas.beginPath();
	this.canvas.moveTo(f.x, f.y);
	this.canvas.lineTo(t.x, t.y);
	this.canvas.stroke();
	this.canvas.closePath();
	this.canvas.restore();
};

MageFight.Spells.Lightning.prototype._makeLight = function(f, t){
	this.canvas.save();
	this.canvas.beginPath();
	this.canvas.strokeStyle = this.Lopt.color;
	this.canvas.lineWidth = this.Lopt.lwidth;
	this.canvas.moveTo(f.x, f.y);
	/*- pocatek -*/
	var tx = t.x-f.x;
	var ty = t.y-f.y;
	var ta = Math.atan2(ty, tx);
	//var dist = Math.sqrt(((f.x-t.x)*(f.x-t.x))+((f.y-t.y)*(f.y-t.y)));
	var dist = this.dist;
	var trans = 0;
	var partx = f.x;
	var party = f.y;
	var tn = ta;
	var i = 0;
	while( trans < dist ){
		var ra = Math.random();
	    ra = ra < 0.5 ? ra*-1 : ra;
		tn = Math.atan2((t.y-party), (t.x-partx));
	    partx = partx + this.Lopt.part * Math.cos(tn);
		party = party + this.Lopt.part * Math.sin(tn);
	    if(ra < this.Lopt.angle){
	        tn = ta + ra;
	        partx = partx + this.Lopt.part * Math.cos(tn);
			party = party + this.Lopt.part * Math.sin(tn);
	    }
		lineDist = Math.sqrt(((partx-t.x)*(partx-t.x))+((party-t.y)*(party-t.y)));
		trans = dist - lineDist;
	    this.canvas.lineTo(partx, party);
		this.canvas.moveTo(partx, party);
		this.canvas.stroke();
		if(lineDist < this.Lopt.lastDist){ this._makeLine({ x : partx, y : party}, t); return; }
	}
	this.canvas.stroke();
	this.canvas.closePath();
	this.canvas.restore();
};

MageFight.Spells.Lightning.prototype.update = function(){
	return;
};

MageFight.Spells.Lightning.prototype.draw = function(){
	if(!this.fired){ return; }
	var f = this.distPos.from;
	var t = this.distPos.to;
	this._makeLight(f, t);
};

MageFight.Spells.Lightning.prototype._stopFire = function(){
	this.fired = false;
};

MageFight.Spells.Lightning.prototype.fire = function(e, elm){
	this.$super();
	if(this.parent.MANA < this.mana || this.fired){
		return;
	}

	setTimeout( this._stopFire.bind(this), this.Lopt.time * 1000 );

	this.makeEvent( 'spellFire', { spell : this } );
	this.fired = true;
	this.parent.MANA -= this.mana;
};