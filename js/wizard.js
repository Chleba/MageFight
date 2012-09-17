var MageFight = MageFight || {};

MageFight.Wizard = JAK.ClassMaker.makeClass({
	NAME : 'MageFight.Wizard',
	VERSION : '0.1',
	IMPLEMENT : JAK.ISignals
});

MageFight.Wizard.prototype.$constructor = function(parent, player, pos, mirrored){
	this.pos = pos;
	this.parent = parent;
	this.player = player;

	this.mirrored = mirrored || false;

	this.HP = this.player.HP;
	this.MANA = this.player.MANA;

	this.dom = {};
	this.ec = [];

	this.canvas = this.parent.getCanvas();

	this.img = new Image();

	this._make();
};

MageFight.Wizard.prototype._make = function(){
	this.animations = {
		spell : JSONWizspell,
		//spell : JSONWizKick,
		easy : JSONWizeasy
	};
	this.status = this.animations.easy;
	this.SPRITE = {
		imgPath : './img/',
		scale : 1.0,
		start : new Date().getTime(),
		mirrored : this.mirrored,
		jsonMap : this.status
	}
	this.sprite = new Sprite(this.canvas, this.SPRITE);
};

MageFight.Wizard.prototype._changeStatus = function(status, callback){
	this.status = status;

	this.SPRITE.start = new Date().getTime();
	this.SPRITE.jsonMap = this.status;
	this.SPRITE.callback = callback || null;

	this.sprite = new Sprite(this.canvas, this.SPRITE);
};

MageFight.Wizard.prototype._endSpellAnimation = function(){
	this._changeStatus(this.animations.easy);
};

MageFight.Wizard.prototype.draw = function(){
	//this.canvas.save();
	//this.canvas.scale(2.0, 2.0);
	//this.sprite.draw({ x : this.pos.x / 2, y : this.pos.y / 2 });
	this.sprite.draw(this.pos);
	//this.canvas.restore();
};

MageFight.Wizard.prototype._fireSpell = function(e){
	// animation change
	if(this.player.id == MageFight.Player.id){
		this._changeStatus(this.animations.spell, this._endSpellAnimation.bind(this));
	}
	
	// spell action
	var spell = e.data.spell;
	if(spell instanceof MageFight.Spells.Shield){
		console.log('shield');
	} else if(spell instanceof MageFight.Spells.Lightning){
		this.dmg( spell.dmg );
		console.log('light');
	} else if(spell instanceof MageFight.Spells.FireBolt){
		this.dmg( spell.dmg );
		console.log('FireBolt');
	}
	
};

MageFight.Wizard.prototype.dmg = function(dmg){
	dmg = dmg || 0;
	this.HP -= dmg;
};
