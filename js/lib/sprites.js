
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
	this.scale = this.opt.scale || 1.0;
	this.mirrored = this.opt.mirrored || false;
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

	// TODO mirrored image
	if(!!this.mirrored){		
		this._makeMirroredImg();
		this._makeMirroredFrames();
	}

	this.steps = this.frames.length;
	//this.interval = this.animation.speed * this.steps;
	this.interval = this.animation.speed;
	this.firstIndex = false;
	this.callCallback = false;
};

Sprite.prototype._makeMirroredImg = function(){
	this.img.style.position = 'absolute';
	this.img.style.top = '-1000px';
	this.img.style.left = '-1000px';
	document.body.appendChild(this.img);

	var is = { w : this.img.offsetWidth, h : this.img.offsetHeight };
	this.imageSize = is;
	var mc = JAK.mel('canvas', { width : is.w, height : is.h });
	//document.body.appendChild(mc);
	mcc = mc.getContext('2d');
	mcc.save();
	mcc.translate(is.w, 0);
	mcc.scale(-1,1);
	mcc.drawImage(this.img, 0, 0);
	this.img = mc;
};

Sprite.prototype._makeMirroredFrames = function(){
	this.frames = JSON.parse(JSON.stringify(this.frames));
	for(var i=0;i<this.frames.length;i++){
		var l = this.frames[i].layers.layer;
		l.rect.x = this.imageSize.w - (l.rect.x+l.rect.width);
	}
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

	if(!!this.mirrored){
		
	}
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
