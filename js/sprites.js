
var Sprite = JAK.ClassMaker.makeClass({
	NAME : 'Sprite',
	VERSION : '1.0'
});

/**
* @param {canvasContext} canvas canvas context
* @param {node} img html image
* @param {object} opt sprites config options
*	img : this.img,
*	steps : 15,
*	interval : 500,
*	scale : 2.0,
*	start : new Date().getTime()
*/
Sprite.prototype.$constructor = function(canvas, opt){
	this.opt = opt || {};
    this.canvas = canvas;
    this.start = this.opt.start;
	this.scale = this.opt.scale || 1.0
	this.jsonMap = this.opt.jsonMap;
	this.finishCallback = opt.callback || null;
	this._make()
};

Sprite.prototype._make = function(){
	var img = this.jsonMap.spriteBuddy.spritesheetSource;
	this.img = new Image();
	this.img.src = this.opt.imgPath+img;

	this.animation = this.jsonMap.spriteBuddy.animations.animation;
	this.frames = this.animation.frames.frame;

	this.steps = this.frames.length;
	//this.interval = this.animation.speed * this.steps;
	this.interval = this.animation.speed;
	this.firstIndex = false;
	this.callCallback = false;
};

Sprite.prototype.getTime = function(){
	return this.animation.speed * this.steps;
};

Sprite.prototype.draw = function(pos){
	var pos = pos || { x : 0, y : 0 };
	var delta = new Date().getTime() - this.start;
	var index = Math.floor(delta / this.interval) % this.steps;

	if(index == 0 && !!this.finishCallback && this.firstIndex && !this.callCallback){
		this.callCallback = true;
		this.finishCallback();
	}
	if(index > 0){ this.firstIndex = true; }

	var layer = this.frames[index].layers.layer;

	var position = { x : pos.x + layer.offset.x, y : pos.y + layer.offset.y };

	var sy = layer.rect.y;
	var height = layer.rect.height;
	var width = layer.rect.width;
	var sx = layer.rect.x;

	// scale
	var finWidth = width*this.opt.scale;
	var finHeight = height*this.opt.scale;

	if(this.img){
	   	this.canvas.drawImage(this.img, sx, sy, width, height, position.x, position.y, finWidth, finHeight);
    }
};
