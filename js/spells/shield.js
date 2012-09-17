
var MageFight = MageFight || {};

MageFight.Spells.Shield = JAK.ClassMaker.makeClass({
	NAME : 'MageFight.Spells.Shield',
	VERSION : '0.1',
	IMPLEMENT : JAK.ISignals,
	EXTEND : MageFight.Spells
});

MageFight.Spells.Shield.id = 3;

MageFight.Spells.Shield.prototype.$constructor = function(parent){
	this.$super(parent);
	
	this.distPos = this.parent.getDistPos();
	this.center = this.distPos.from;

	this.dmg = 50;
	this.mana = 20;

	this._makeHandler('Shield');
};

MageFight.Spells.Shield.prototype.draw = function(){
	if(!this.fired){ return; }

	var mpw = 25;
	var mph = 25;

	var ax = (this.center.x);
	var ay = (this.center.y);

	this._lines = [
		{ width: 18, opacity:0.1, color: "rgba(255,0,0,0.1)" },
		{ width: 14, opacity:0.2, color: "rgba(255,0,0,0.2)" },
		{ width: 10, opacity:0.3, color: "rgba(255,0,0,0.3)" },
		{ width: 6, opacity:1, color: "rgba(255,0,0,1)" },
		{ width: 2, opacity:1, color: "rgb(255,255,255)" }
	];
	
	for(var i=0;i<this._lines.length;i++){
		this.canvas.save();
		this.canvas.beginPath();
		this.canvas.lineWidth = this._lines[i].width;
		//this.ct.canvasMap.strokeStyle = 'rgba(100, 100, 100, 0.'+i+')';
		//var styleStr = 'rgba('+(i*11)+', '+(i*11)+', '+(i*11)+', 0.'+(9-i)+')';
		var styleStr = this._lines[i].color;
		this.canvas.strokeStyle = styleStr;
		this.canvas.arc(ax, ay, mpw+(mpw/2), 0, Math.PI*2, true);
		this.canvas.closePath();
		this.canvas.stroke();
		this.canvas.restore();
	}
};

MageFight.Spells.Shield.prototype.fire = function(e, elm){
	this.$super();
	if(this.parent.MANA < this.mana || this.fired){
		return;
	}
	this.makeEvent( 'spellFire', { spell : this } );
	this.fired = true;
	this.parent.MANA -= this.mana;
};