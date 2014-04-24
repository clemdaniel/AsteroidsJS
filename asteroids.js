function SpaceObject(canvas, game){
	this.canvas = canvas;
	
	this.setGame = function(game){
		this.game = game;
	}
	
	function init(){
		this.x, this.y;
		this.velocity = {
			x: 0,
			y: 0
		};
	
		this.x = randomInt(0, this.canvas.width);
		this.y = randomInt(0, this.canvas.height);
	}
	
	function setVelocity(x, y){
		this.velocity.x = x;
		this.velocity.y = y;
	}
	
	function getVelocity(){
		return this.velocity;
	}
	
	function destroy(){
		this.destroyed = true;
	}
	
	this.canCollideWith = function(otherItem){
		return false;
	}
	
	this.getBoundingBox = function getBoundingBox(){
		var left = this.x - 10;
		var right = this.x + 10;
		var top = this.y - 10;
		var bottom = this.y + 10;
		return [{x:left, y: top}, {x: right, y: top}, {x: right, y: bottom}, {x: left, y: bottom}];
	};
	
	this._update = function(){
		this.update();
		this.game.getPowerUp(this, "update");
	}
	
	function update(){
		this.x += this.velocity.x;
		this.y += this.velocity.y;
		
		if(this.x < 0){
			this.x = this.canvas.width + this.x;
		}
		if(this.y < 0){
			this.y = this.canvas.height + this.y;
		}
		
		this.x = this.x % this.canvas.width;
		this.y = this.y % this.canvas.height;
	}
	
	function paint(){
		var ctx = this.canvas.getContext("2d");
		//arc(x, y, radius, startAngle, endAngle, anticlockwise)
		ctx.beginPath();
		ctx.strokeStyle = 'rgb(255, 255, 255)';
		ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
		ctx.stroke();
	}		

	this.destroy = destroy;
	this.update = update;
	this.paint = paint;
	this.init = init;

	return this;
};
asteroid.prototype = new SpaceObject();
function asteroid(canvas, x, y, radius){	
	function init(){
		this.canvas = canvas;
		
		if(!radius){
			this.radius = 20;
		}
		else{
			this.radius = radius;
		}
		this.x, this.y;
		this.points = 1 / this.radius * 100;
		this.velocity = {
			x: 0,
			y: 0
		};
		
		if(x === undefined || y === undefined){
		
			var leftRight = randomInt(0, 2);
			var topBottom = randomInt(0, 2);
			
			if(leftRight === 0){
				this.x = randomInt(0, 0.25 * this.canvas.width);
			}
			else{
				this.x = randomInt(0.75 * this.canvas.width, this.canvas.width);
			}
			if(topBottom === 0){
				this.y = randomInt(0, 0.25 * this.canvas.height);
			}
			else{
				this.y = randomInt(0.75 * this.canvas.height, this.canvas.height);
			}
		}
		else{
			this.x = x;
			this.y = y;
		}
		
		var maxV = 20 / this.radius;
		
		this.velocity.x = randomFloat(-maxV, maxV);
		this.velocity.y = randomFloat(-maxV, maxV);
	}
	
	this.getBoundingBox = function getBoundingBox(){
		var left = this.x - this.radius;
		var right = this.x + this.radius;
		var top = this.y - this.radius;
		var bottom = this.y + this.radius;
		return [{x:left, y: top}, {x: right, y: top}, {x: right, y: bottom}, {x: left, y: bottom}];
	};
	
	this.destroy = function(){
		if(this.radius > 5){
			this.generateChildren(2);
		}
		this.destroyed = true;
	}
	
	this.canCollideWith = function(item){
		var can =  
			(item instanceof spaceship ||
			item instanceof missile);
		return can;
	}
	
	this.generateChildren = function(count){
		for(var i = 0; i < count; i++){
			this.game.addItem(new asteroid(this.canvas, this.x, this.y, this.radius / 2));
		}
	}

	this.paint = function(){
		var ctx = this.canvas.getContext("2d");
		//arc(x, y, radius, startAngle, endAngle, anticlockwise)
		ctx.beginPath();
		ctx.strokeStyle = 'rgb(255, 255, 255)';
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.stroke();
		
		//debug collisions
		//connectTheDots(ctx, this.getBoundingBox());
	}		
	
	this.init = init;
	
	this.init();
	return this;
};
explosion.prototype = new SpaceObject();
function explosion(canvas, x, y, radius){
	this.canvas = canvas;
	this.x = x + randomInt(-3, 3);
	this.y = y + randomInt(-3, 3);
	this.ttl = 10;
	this.radius = radius;
	this.velocity = {
		x : 0,
		y: 0
	};
	
	this.init = function(){
		this.opacity = 0.8;
	}
	
	this.getBoundingBox = function(){
		return [{x: -1, y: -1}, {x: -1, y: -1}, {x: -1, y: -1}, {x: -1, y: -1}];
	}
	
	this.update = function(){
		this.ttl--;
		if(this.ttl == 0){
			this.destroy();
		}		
		this.radius += randomInt(-5, 5);
		if(this.radius <= 0){
			this.radius = 5;
		}
		explosion.prototype.update.call(this);
	}
	
	this.paint = function(){
		var ctx = this.canvas.getContext("2d");
		//arc(x, y, radius, startAngle, endAngle, anticlockwise)
		ctx.beginPath();
		var color = randomInt(0, 3);
		switch(color){
			case 0:
				color = "rgba(255, 0, 0, ";
				break;
			case 1:
				color = "rgba(255, 255, 224, ";
				break;
			case 2:
				color = "rgba(255, 102, 0, ";
		}
		
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fillStyle = color + this.opacity + ")";
		ctx.fill();
		for(var i = 0; i < 3; i++){
			this.game.addEffect(new smoke(this.canvas, this.x, this.y, 0));		
		}
	}	
	
	this.init();
	return this;
}

smoke.prototype = new SpaceObject();
function smoke(canvas, x, y, angle){
	this.canvas = canvas;
	this.x = x + randomInt(-3, 3);
	this.y = y + randomInt(-3, 3);
	var velocityMx = 10;
	this.radius = 3;
	this.angle = angle;
	this.velocity = {
		x : 0,
		y: 0
	};
	
	this.init = function(){
		
		var cosTheta = Math.cos(this.angle);
		var sinTheta = Math.sin(this.angle);							
		var dx = cosTheta;
		var dy = sinTheta;
		
		this.velocity.x = -0.5 * dx + randomFloat(-0.5, 0.5);
		this.velocity.y = -0.5 * dy + randomFloat(-0.5, 0.5);
		
		this.opacity = 0.3;
	}
	
	this.getBoundingBox = function(){
		return [{x: -1, y: -1}, {x: -1, y: -1}, {x: -1, y: -1}, {x: -1, y: -1}];
	}
	
	this.update = function(){
		this.opacity -= 0.008;
		if(this.opacity <= 0){
			this.opacity = 0;
		}
		smoke.prototype.update.call(this);
	}
	
	this.paint = function(){
		var ctx = this.canvas.getContext("2d");
		//arc(x, y, radius, startAngle, endAngle, anticlockwise)
		ctx.beginPath();
		//ctx.strokeStyle = 'rgba(200, 200, 200, '+this.opacity + ')';
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fillStyle = 'rgba(200, 200, 200, '+this.opacity + ')';
		ctx.fill();
		//ctx.stroke();
		
		if(this.opacity <= 0){
			this.destroy();
		}
	}	
	
	this.init();
	return this;
}

var Powers = {};

Powers.MultiShot = new power({
	rarity: 1,
	label: "Multi Shot!",
	phase: "shoot",
	objectType: spaceship,
	action: function(item){
		var tip = item.getShipPoints()[0];
		for(var i = 0; i < 5; i++){
			var angle = item.angle + toRadians(randomInt(-15, 15));
			if(angle < 0){
				angle = (Math.PI * 2) + angle;
			}
			angle = angle % toRadians(360);
			game.addItem(new missile(item.canvas, tip.x, tip.y, angle, item.velocity.x, item.velocity.y, 3));
		}
	}
});

Powers.BigShot = new power({
	rarity: 1,
	label: "BIG Shot!",
	phase: "update",
	objectType: missile,
	action : function(item){
		item.radius = 20;		
	}	
});

Powers.StickyShip = new power({
	rarity: 2,
	label: "Sticky Ship!",
	phase: "update",
	objectType: spaceship,
	action: function(item){
		if(!item.keyInput.isAccel()){
			item.velocity.x = 0;
			item.velocity.y = 0;
		}
	},
	deactivate: function(item){
		item.velocity.x = 0;
		item.velocity.y = 0;
	}
});

Powers.OneUp = new power({
	rarity: 3,
	label: "1UP!",
	objectType: spaceship,
	activate : function(item){
		item.lives++;
	}
});

Powers.TimeFreeze = new power({
	rarity: 2,
	label: "Freeze!",
	phase: "update",
	objectType: asteroid,
    asteroids: [],
	activate : function(item){
		this.asteroids.push(item);
		item.velocity = {x : 0, y: 0};
	},
	action : function(item){
		if(contains(this.asteroids, item) < 0){
			this.activate(item);
		}
	},
	deactivate : function(item){
		var maxV = 20 / item.radius;
		item.velocity.x = randomFloat(-maxV, maxV);
		item.velocity.y = randomFloat(-maxV, maxV);
	}
});


function power(args){
/*
	
	args : {
		label, {String}, powerup label to be displayed
		phase, {String} 'update' or 'shoot'. if neither, action will never fire, but activate and deactivate will
		objectType,{Object} constructor of objects that are affected by this powerup
		activate, {Function} called once on each item affected at powerup activation
		deactivate, {Function} called once on each item affected at powerup deactivation
		action {Function} called on each item affected whenever the "phase" occurs for that item
	}
*/
	var startTime;
	var duration = 15 * 1000;
	if(!args.objectType){
		args.objectType = null;
	}
	if(!args.phase){
		args.phase = "";
	}
	this.rarity = args.rarity;
	if(!this.rarity){
		this.rarity = 1;
	}
	var labelSpan = null;
	var timerSpan = null;
	var timerInterval = null;
	this.label = args.label;
	
	this.init = function(span){
		startTime = (new Date()).getTime();
		labelSpan = span;
		labelSpan.innerHTML = args.label;
		timerSpan = document.createElement("span");
		labelSpan.appendChild(timerSpan);
		timerInterval = setInterval(function(){
			var time = (Math.floor(duration - ((new Date()).getTime() - startTime)) / 1000).toFixed(0);
			if(time < 5){
				timerSpan.className = "warning";
			}
			timerSpan.innerHTML = time;			
		}, 1000);
		if(args.init){
			args.init();
		}
	}

	this.expired = function(){
		var now = (new Date()).getTime();
		return now - startTime > duration;
	}
	
	this.affectsItem = function(item){
		var affects = (item instanceof args.objectType);
		return affects;
	}
	
	this.affectsPhase = function(phase){
		return args.phase.toLowerCase() == phase.toLowerCase();
	}
	
	this.getPhase = function(){
		return args.phase;
	}
	
	this.getLabel = function(){
		return labelSpan;
	}
	
	this.activate = function(item){
		if(args.activate && this.affectsItem(item)){
			args.activate(item);
			return true;
		
		}
		return false;
	}
	
	this.deactivate = function(item){		
		if(args.deactivate && this.affectsItem(item)){
			args.deactivate(item);
			return true;
		}
		return false;
	}
	
	this.action = function(item){
		if(args.action && this.affectsItem(item)){
			args.action(item);
			return true;
		}		
		return false;
	}	
	
	this.terminate = function(){
		if(timerInterval){
			clearInterval(timerInterval);
			timerInterval = null;
		}
		labelSpan.remove();
		if(args.terminate){
			args.terminate();
		}
	}
};
powerup.prototype = new SpaceObject();
function powerup(canvas, x, y, power){
/////////////////////////////////////
/*	
	 Power ups have two phases:
	1. space object (awaiting pickup) -> draws and updates
	2. as a powerup (after being picked up) -> interacts with object behaviors through hooks based on objectType and phase
*/
////////////////////////////////////
	this.canvas = canvas;
	this.x = x;
	this.y = y;
	this.lifetime = 12 * 1000; // 20 seconds to pick up the item
	this.power = power;
	
	this.radius = 10;
	this.velocity = {
		x : 0,
		y: 0
	};
	
	this.init = function(){
		this.createTime = (new Date()).getTime();
		this.opacity = 1.0;
		this.color = [
			255, 0 , 0
			// randomInt(0, 255),
			// randomInt(0, 255),
			// randomInt(0, 255)
		]
	}
	
	this.getBoundingBox = function getBoundingBox(){
		var left = this.x - this.radius;
		var right = this.x + this.radius;
		var top = this.y - this.radius;
		var bottom = this.y + this.radius;
		return [{x:left, y: top}, {x: right, y: top}, {x: right, y: bottom}, {x: left, y: bottom}];
	};

	this.expired = function(){
		return this.power.expired();
	}
	
	this.update = function(){
		var now = (new Date()).getTime();
		var timeLived = now - this.createTime;
		if(timeLived > this.lifetime){
			this.destroy(false);
		}		
		else if(this.lifetime - timeLived < this.lifetime/2){
			this.opacity = (this.lifetime - timeLived) / (this.lifetime);
		}
		powerup.prototype.update.call(this);
	}
	
	this.pickup = function(){
		this.power.init();
	}
	
	this.canCollideWith = function(item){
		var can =  (item instanceof spaceship);
		return can;
	}
	
	this.paint = function(){
		var ctx = this.canvas.getContext("2d");
		//arc(x, y, radius, startAngle, endAngle, anticlockwise)
		ctx.beginPath();
		ctx.fillStyle = "rgba(" + this.color.join(",") + ", " + this.opacity + ")";			
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.font = "10px monospace";
		ctx.fillStyle = "#fff";
		ctx.fillText(this.power.label,this.x, this.y);
		ctx.strokeStyle = "rgba(" + this.color.join(",") + ", " + this.opacity + ")";	
		ctx.stroke();
	}	
	
	this.init();
	return this;
}

missile.prototype = new SpaceObject();
function missile(canvas, x, y, angle, srcDx, srcDy, radius){
	this.canvas = canvas;
	this.ttl; //Time To Live
	this.startTime;
	this.x = x;
	this.y = y;
	var velocityMx = 10;
	this.radius = radius ? radius : 3;
	this.angle = angle;
	this.velocity = {
		x : 0,
		y: 0
	};
	
	this.init = function(){
		this.startTime = (new Date()).getTime();
		this.ttl = 1.5;
		
		var cosTheta = Math.cos(this.angle);
		var sinTheta = Math.sin(this.angle);							
		var dx = cosTheta;
		var dy = sinTheta;
		//console.log("accelerate", dx, dy);
		//console.log("angle", (Math.PI * 2) - this.angle, 360 - toDegrees(this.angle));
		
		this.velocity.x = velocityMx * dx;
		this.velocity.y = velocityMx * dy;
	}
	
	this.update = function(){
		var now = (new Date()).getTime();
		if(now - this.startTime > (this.ttl * 1000)){
			this.destroy();
		}
		
		game.getPowerUp(this, "update");
		missile.prototype.update.call(this);
	}
	
	this.paint = function(){
		var ctx = this.canvas.getContext("2d");
		//arc(x, y, radius, startAngle, endAngle, anticlockwise)
		ctx.beginPath();
		ctx.strokeStyle = 'rgb(0, 100, 255)';
		ctx.fillStyle = 'rgba(0, 100, 255, 0.2)';
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}
	
	this.canCollideWith = function(item){
		var can = (item instanceof asteroid);
		return can;
	}

	this.getBoundingBox = function getBoundingBox(){
		var left = this.x - this.radius;
		var right = this.x + this.radius;
		var top = this.y - this.radius;
		var bottom = this.y + this.radius;
		return [{x:left, y: top}, {x: right, y: top}, {x: right, y: bottom}, {x: left, y: bottom}];
	};	
	
	this.init();
	return this;
}


spaceship.prototype = new SpaceObject();
function spaceship(canvas){				
	this.canvas = canvas;
	
	this.angle = Math.PI * 1.5; //270 Degrees, IE, straight up, or -1, 0 on unit circle
	
	var fuzz = 1e-4; //handle 0-ish floats
	var MAX_SPEED = 25; //max vector magnitude of velocity
	var FINE_TURN_SPEED = 5; //degrees per turn command
	var COARSE_TURN_SPEED = 10; //degrees per turn command
	var lastShot = (new Date()).getTime();
	var shotDelay = 200; //millis
	this.boosterCount = 0;
	
	this.getShotDelay = function(){
		return shotDelay;
	}
	
	this.getVelocity = function(){
		return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
	}	
	
	this.smokeTrail = function(){
		if(this.boosterCount == 0){
			//show the booster + smoke for 20 animation loops
			this.boosterCount = 20;
		}
	}
	
	this.accelerate = function(){
						
		var cosTheta = Math.cos(this.angle);
		var sinTheta = Math.sin(this.angle);							
		var dx = cosTheta;
		var dy = sinTheta;
		//console.log("accelerate", dx, dy);
		//console.log("angle", (Math.PI * 2) - this.angle, 360 - toDegrees(this.angle));
		
		this.velocity.x += dx;
		this.velocity.y += dy;		
		
		if(this.getVelocity() > MAX_SPEED){
			console.log("over max velocity, limiting", this.getVelocity(), this.velocity);
			this.velocity.x -= dx;
			this.velocity.y -= dy;
		}
		
		this.smokeTrail();
	}
	
	this.rotateLeft = function(){
		this.rotate(1);
	}
	
	this.rotateRight = function(){
		this.rotate(-1);
	}
	
	this.getShipPoints = function(){
		var degAngle = toDegrees(this.angle);
		return [getArcCoordinates(this.x, this.y, degAngle, 20),
				getArcCoordinates(this.x, this.y, normalizeAngle(degAngle - 140), 20),
				getArcCoordinates(this.x, this.y, normalizeAngle(degAngle + 140), 20)];
	}
	
	this.getBoundingBox = function getBoundingBox(){
		//get the ship's points
		
		var shipPoints = this.getShipPoints();
		var points = shipPoints;
		var maxX = points[0].x;
		var minX = points[0].x;
		var maxY = points[0].y;
		var minY = points[0].y;
		for(var i = 1; i < 3; i++){
			maxX = Math.max(maxX, points[i].x);
			minX = Math.min(minX, points[i].x);
			maxY = Math.max(maxY, points[i].y);
			minY = Math.min(minY, points[i].y);
		}
		
		return [{x: minX, y: minY}, {x: maxX, y: minY}, {x: maxX, y: maxY}, {x: minX, y: maxY}];
	};

	this.rotationTime = (new Date()).getTime();
	this.rotationSpeed = 0;
	this.rotate = function(sign){
		var now = (new Date()).getTime();
		if(now - this.rotationTime > 100){
			//console.log("fine rotation", now);
			this.rotationSpeed = FINE_TURN_SPEED;
		}
		else{
			//console.log("rough / continuous rotation", now);
			this.rotationSpeed = COARSE_TURN_SPEED;
		}
		this.rotationTime = now;
		if(sign < 0){
			this.angle += toRadians(this.rotationSpeed);
		}
		else{
			this.angle -= toRadians(this.rotationSpeed);
		}				
		if(this.angle < 0){
			this.angle = (Math.PI * 2) + this.angle;
		}
		this.angle = this.angle % toRadians(360);
		//console.log("rotated", (Math.PI * 2) - this.angle, 360 - toDegrees(this.angle));
	}
	
	this.shoot = function(){
		var now = (new Date()).getTime();
		if(now - lastShot < shotDelay){
			return;
		}
		lastShot = now;
		var degAngle = toDegrees(this.angle);
		var p1 = getArcCoordinates(this.x, this.y, degAngle, 20);
		if(!game.getPowerUp(this, "shoot")){
			this.game.addItem(new missile(this.canvas, p1.x, p1.y, this.angle, this.velocity.x, this.velocity.y, 3));
		}		
	}	
	
	this.canCollideWith = function(item){
		var can =  
			(item instanceof asteroid ||
			item instanceof powerup);
		return can;
	}
	
	this.destroy = function(){
		this.lives--;
		this.boosterCount = 0;
		this.destroyed = true;
		this.keyInput.clearInputs();
	}
	
	this.update = function(){
		spaceship.prototype.update.call(this);
	}
	
	this.paint = function(){
		var ctx = this.canvas.getContext("2d");
		//arc(x, y, radius, startAngle, endAngle, anticlockwise)
		var shipPoints = this.getShipPoints();
		ctx.strokeStyle = 'rgb(0, 255, 0)';
		connectTheDots(ctx, shipPoints);
		if(this.boosterCount > 0){
			this.drawBooster();
		}
		//debug collisions:
		//connectTheDots(ctx, this.getBoundingBox());
	}
	
	this.drawBooster = function(){
		this.boosterCount--;
		var d_angle = toDegrees(this.angle);
		var width = randomInt(5, 10);
		var height = randomInt(10, 20);
		var tail = vectorAdd({x: this.x, y: this.y}, scaleVector(this.angle, -18));
		
		var points = [	getArcCoordinates(tail.x, tail.y, d_angle - 90, width),
						getArcCoordinates(tail.x, tail.y, d_angle + 90, width),
						getArcCoordinates(tail.x, tail.y, normalizeAngle(180 + d_angle), height)];
		var ctx = this.canvas.getContext("2d");
		ctx.beginPath();
		ctx.strokeStyle = "orange";
		connectTheDots(ctx, points);
		var opacity = randomFloat(0.25, 0.75);
		var color = randomInt(0, 3);
		switch(color){
			case 0:
				color = "rgba(255, 0, 0, ";
				break;
			case 1:
				color = "rgba(255, 255, 224, ";
				break;
			case 2:
				color = "rgba(255, 102, 0, ";
		}
		ctx.fillStyle = color + opacity + ")";
		ctx.fill();

		var point = points[2];		
		this.game.addEffect(new smoke(this.canvas, point.x, point.y, this.angle));		
	}

	this.reset = function(){
		this.destroyed = false;
		this.init();
		this.keyInput.clearInputs();
	}
	
	this.init = function(){
		spaceship.prototype.init.call(this);
		this.angle = Math.PI * 1.5;
		this.x = this.canvas.width / 2;
		this.y = this.canvas.height / 2;
	}
	
	this.lives = 3;
	this.init();

	this.keyInput = new (function(player){
		var leftInterval, rightInterval, upInterval, shootInterval;
		var left = false;
		var right = false;
		var up = false;
		var shoot = false;

		this.clearInputs = function(){
			left = right = up = shoot = false;
			clearInterval(leftInterval);
			clearInterval(rightInterval);
			clearInterval(upInterval);
			clearInterval(shootInterval);
			leftInterval = rightInterval = upInterval = shootInterval = null;
		}
		
		this.isAccel = function(){
			return up;
		}
		
		this.isRotate = function(){
			return left || right;
		}
		
		this.isShoot = function(){
			return shoot;
		}
		
		this.handleInput = function(e){
			//39 right, 37 left, 38 up, 40 down, 32 space;
			var down = e.type === "keydown";
			switch(e.keyCode){
				//left
				case 37:
					if(!left && down){
						leftInterval = setInterval(function(){
							player.rotateLeft();
						}, 30);
					}
					left = down;
					break;
				//right
				case 39:
					if(!right && down){
						rightInterval = setInterval(function(){
							player.rotateRight();
						}, 30);
					}
					right = down;
					break;
				//up
				case 38:
					if(!up && down){
						upInterval = setInterval(function(){
							player.accelerate();
						}, 50);
					}
					up = down;
					break;
			    case 32:
					if(!shoot && down){
						shootInterval = setInterval(function(){
							player.shoot();
						}, player.getShotDelay());
					}
					shoot = down;
					break;
			}
			if(left){
				player.rotateLeft();
			}
			else{
				clearInterval(leftInterval);
				leftInterval = null;
			}
			if(right){
				player.rotateRight();
			}	
			else{
				clearInterval(rightInterval);
				rightInterval = null;
			}
			if(up){
				player.accelerate();
			}
			else{
				clearInterval(upInterval);
				upInterval = null;
			}
			if(shoot){
				player.shoot();
			}
			else{
				clearInterval(shootInterval);
				shootInterval = null;
			}
		};
	})(this);
	
	this.handleKeyInput = function(e){
		this.keyInput.handleInput(e);
	};
	
	return this;
}
function Game(canvas){
	var level = 0;
	var roundOver = true;
	var gameOver = false;
	var player;
	var items = [];
	var effects = [];
	var wait = false;
	
	var powers = [Powers.StickyShip, Powers.MultiShot, Powers.BigShot, Powers.OneUp, Powers.TimeFreeze];
	
	var powerUps = [];
	var asteroids = [];
	var score;
	
	var scoreLabel = document.getElementById("score");
	var livesLabel = document.getElementById("lives");
	var levelLabel = document.getElementById("level");
	
	var messageDiv = document.getElementById("message");
	var highscoresDiv = document.getElementById("highscores");
	var powerUpSpan = document.getElementById("powerUp");
	var instructionSpan = document.getElementById("instruction");
	instructionSpan.style.left = canvas.width / 2 - 100 + "px";
	
	var keyListener = (function(game){
		var leftInterval, rightInterval, upInterval, shootInterval;
		var left = false;
		var right = false;
		var up = false;
		var shoot = false;

		function clearIntervals(){
			clearInterval(leftInterval);
			clearInterval(rightInterval);
			clearInterval(upInterval);
			clearInterval(shootInterval);
			leftInterval = rightInterval = upInterval = shootInterval = null;
		}
		
		return function (e) {
		    //prevent navigation keys from doing their default behaviors
		    if ((!game.waiting() && e.keyCode == 32) || (e.keyCode >= 37 && e.keyCode <= 40)) {
		        e.preventDefault();
		    }
		    if (!game.waiting()) {
		        if (e.keyCode === 13 && !game.started) {
		            game.start();
		        }
		        else if (e.keyCode === 13 && game.started && roundOver) {
		            game.beginRound();
		        }
		        else if (e.keyCode === 13 && player.destroyed) {
		            player.reset();
		            game.addItem(player);
		        }
		        else if (gameOver && e.keyCode === 13) {
		            game.reset();
		        }
		    }
			if(!player || player.destroyed || roundOver || gameOver){
				clearIntervals();
				return;
			}
			switch(e.keyCode){
				//p
				case 80:
					game.pause();
					return;
				//o
				case 79:
					game.unpause();
					return;
			};
			player.handleKeyInput(e);
		}
	})(this);
	
	document.addEventListener("keydown", keyListener);
	document.addEventListener("keyup", keyListener);

	var ctx = canvas.getContext("2d");

	this.addItem = function(spaceObject){
		spaceObject.setGame(this);
		if(spaceObject instanceof asteroid){
			asteroids.push(spaceObject);
		}
		items.push(spaceObject);
	}
	
	this.addEffect = function(spaceObject){
		spaceObject.setGame(this);
		effects.push(spaceObject);
	}
	
	this.addPowerUp = function(powerup){
		powerup.setGame(this);
		powerUps.push(powerup);
		powerup.power.init(document.createElement("span"));
		activatePower(powerup.power);
		powerUpSpan.appendChild(powerup.power.getLabel());
	}
	
	function activatePower(power){
		for(var i = 0; i < items.length; i++){
			power.activate(items[i]);
		}
	}
	
	function deactivatePower(power){
		for(var i = 0; i < items.length; i++){
			power.deactivate(items[i]);
		}
		power.terminate();
	}
	
	this.checkPowerUpExpirations = function(){
		for(var i = 0; i < powerUps.length; i++){
			if(powerUps[i].expired()){
				deactivatePower(powerUps[i].power);
				powerUps.splice(i, 1);
				i--;
			}
		}
	}
	
	this.getPowerUp = function(item, phase){
		var poweredUp = false;
		for(var i = 0; i < powerUps.length; i++){
			if(powerUps[i].power.affectsPhase(phase)){
				poweredUp = powerUps[i].power.action(item) || poweredUp;
			}
		}
		return poweredUp;
	}
	
	this.removePowerUps = function(){
		//remove all powerups at the end of a round
		for(var i = 0; i < powerUps.length; i++){
			deactivatePower(powerUps[i].power);
		}
		powerUps = [];
		powerUpSpan.innerHTML = "";
	}
	
	this.drawStatus = function(){
		scoreLabel.innerHTML = score;
		livesLabel.innerHTML = player.lives;
		levelLabel.innerHTML = level;	
	}
	
	function dateTimeString (date){
		var d = [date.getMonth() + 1, date.getDate(), date.getFullYear()].join("/");
		var t = date.toLocaleTimeString();
		return d + " " + t;
	};
	
	this.updateGameState = function(){
		if(player.destroyed){
		    if (player.lives <= 0) {
				this.handleGameOver();
			}
			else{
				this.setInstruction("Enter to respawn");
			}
		}
		else if(asteroids.length === 0){
			this.endRound();
		}
		else{
			this.setInstruction("");
		}
	}
	
	var pause = false;
	this.pause = function(){
		pause = true;
		this.displayMessage("Paused. Press 'o' to unpause");
	}
	
	this.unpause = function(){
		if(pause){
			hideMessage();
			pause = false;
			requestAnimationFrame(this.draw);
		}
	}

	this.waiting = function () {
	    return wait;
	}

	this.wait = function () {
	    wait = true;
	}

	this.resume = function () {
	    wait = false;
	}
	
	// diagnostic variables (perf measurement)
	var frameCount = 0;
	var frameRateSpan = document.getElementById("frameRate");
	setInterval(function(){
		frameRateSpan.innerHTML = frameCount;
		frameCount = 0;
	}, 1000);
	
	this.draw = (function(ctx){
		function d(){
			frameCount++;
			if(pause){
				return;
			}
			//console.log("paint", (new Date()).getTime());
			this.updateGameState();
			if(gameOver || roundOver){
				return;
			}
			clear();
			this.checkPowerUpExpirations();
			this.checkForCollisions();
			for(var i = 0; i < items.length; i++){
				if(items[i].destroyed){
					if(items[i].points){
						score += items[i].points;
					}
					if(items[i] instanceof asteroid){
						this.checkForPowerUps(items[i].x, items[i].y, items[i].radius);
						var index = contains(asteroids, items[i]);
						if(index >= 0){
							asteroids.splice(index, 1);
						}
					}
					items.splice(i, 1);
					i--;
					continue;
				}
				items[i]._update();
				items[i].paint();
			}
			for(var i = 0; i < effects.length; i++){
				if(effects[i].destroyed){
					effects.splice(i, 1);
				}
				else{
					effects[i].update();
					effects[i].paint();
				}
			}
			this.drawStatus();
			requestAnimationFrame(this.draw);
		}
		return function(){
			d.apply(ctx, arguments);
		}
	})(this)
	
	this.checkForPowerUps = function(x, y){
		//decide if we are going to spawn a powerup
		if(randomInt(0, 50) < 3){
			//decide which powerup to create based on rarity
			
			var power = this.getNextPowerUp();
			game.addItem(new powerup(canvas, x, y, power));			
		}
	}
	
	this.getNextPowerUp = (function(){		
		var bag = [[],[],[]];
		for(var i = 0; i < powers.length; i++){
			var power = powers[i];
			bag[power.rarity - 1].push(power);
		}
		//rarities can be 1-3, higher is more rare
		//p(1) = 60%, p(2)=30%, p(3) = 10%
		return function(){
			var pick = randomInt(0, 10);
			if(pick === 0 && bag[2].length > 0){
				return bag[2][randomInt(0, bag[2].length)];
			}
			else if(pick > 0 && pick < 4 && bag[1].length > 0){
				return bag[1][randomInt(0, bag[1].length)];
			}
			else if(bag[0].length > 0){
				return bag[0][randomInt(0, bag[0].length)];
			}
			else if(powers.length > 0){
			    return powers[randomInt(0, powers.length)];
			}
		}
	})()
	
	this.started = false;
	this.start = function(){
		score = 0;		
		player = new spaceship(canvas);
		this.started = true;
		this.beginRound();
	}
	
	this.reset = function(){
		level = 0;
		gameOver = false;
		roundOver = false;
		items = [];
		asteroids = [];
		effects = [];
		this.removePowerUps();
		this.start();
	}
	
	this.beginRound = function(){
		if(gameOver){
			return;
		}
		items = [];
		asteroids = [];
		effects = [];
		this.removePowerUps();
		var astrCount = 6 + level;
		
		for(var i = 0; i < astrCount; i++){
			var astr = new asteroid(canvas);
			this.addItem(astr);
		}
		player.reset();
		this.addItem(player);
		roundOver = false;
		requestAnimationFrame(this.draw);
	}
	
	this.endRound = function(){
		level++;
		roundOver = true;
		score += 1000 * level;
		this.removePowerUps();
		this.displayMessage("Round Complete!");
	}
	
	this.handleGameOver = function(){
		this.removePowerUps();
		gameOver = true;
		this.started = false;
		this.displayMessage("<div>Game Over!</div>");
		this.wait();
		var self = this;
		self.getHighScores().done(function (highscores) {
			highscores.splice(20);
			self.postNewScore().done(function (score) {
				var id = score.ID;
				highscores.push(score);
				function comparator(a, b) {
					if (b.score === a.score) return 0;
					return b.score - a.score;
				}
				highscores.sort(comparator);
				var newHighScore = highscores[0].ID === id;
				self.displayHighscores(highscores, newHighScore, id);
				self.resume();
				self.setInstruction("Enter to Play Again.");
			});
		})
		.fail(function(){
			self.getLocalHighScores().done(function(){
				self.resume();
				self.setInstruction("Enter to Play Again.");
			});
		});
	}
	
	this.isCollision = function(box1, box2){
		var minX1 = box1[0].x;
		var minX2 = box2[0].x;
		var maxX1 = box1[2].x;
		var maxX2 = box2[2].x;
		var minY1 = box1[0].y;
		var minY2 = box2[0].y;
		var maxY1 = box1[2].y;
		var maxY2 = box2[2].y;
		
		var x = false;
		var y = false;
		if(	(minX1 > minX2 && minX1 < maxX2) ||
			(maxX1 > minX2 && maxX1 < maxX2)) {
			x = true;
		}
		if( (minY1 > minY2 && minY1 < maxY2) ||
			(maxY1 > minY2 && maxY1 < maxY2)) {
			y = true;
		}
		return x && y;
	}
	
	this.checkForCollisions = function(){
		for(var i = 0; i < items.length; i++){
			var item1 = items[i];
			if(item1.destroyed) continue;
			for(var j = 0; j < items.length; j++){
				var item2 = items[j];
				if(	i === j || 
					item2.destroyed || 
					!item1.canCollideWith(item2)){
					continue;
				}
				
				var box1 = item1.getBoundingBox();
				var box2 = item2.getBoundingBox();
				var d = distance({x: item1.x, y: item1.y}, {x: item2.x, y: item2.y});
				if(d < 100){
					if(this.isCollision(box1, box2)){
						if(item1 instanceof powerup){
							this.addPowerUp(item1);
							item1.destroy();
							continue;
						}
						if(item2 instanceof powerup){
							this.addPowerUp(item2);
							item2.destroy();
							continue;
						}
						item1.destroy();
						item2.destroy();
						var point = midpoint({x:item1.x, y:item1.y}, {x:item2.x, y:item2.y});
						var width1 = box1[1].x - box1[0].x
						var width2 = box2[1].x - box2[0].x;
						var radius = width1 > width2 ? width1 / 2 : width2 / 2;
						this.addEffect(new explosion(canvas, point.x, point.y, radius));
					}
				}				
			}
		}
	}
	
	function clear(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		hideMessage();
	}	
	
	this.displayMessage = function(message, append){
	    clear();
	    if (append) {
	        messageDiv.innerHTML += message;
	    }
	    else {
	        messageDiv.innerHTML = message;
	    }
		var style = messageDiv.style;
		style.display = "block";
		style.top = canvas.height/2 - messageDiv.clientHeight/2 + "px";
		style.left = canvas.width/2 - messageDiv.clientWidth/2 + "px";
	}
	
	function hideMessage(){
		messageDiv.style.display = "none";
	}
	
	this.setInstruction = function(instruction){
		if(instruction != instructionSpan.innerHTML){
			instructionSpan.innerHTML = instruction;
		}
	}

	this.getLocalHighScores = function() {
		var def = $.Deferred();
		this.getNickname(function(name){
			var highscores = JSON.parse(window.localStorage.getItem("asteroidsjs.highscores"));
			if(!highscores){
				highscores = [];
			}
			function compare(score1, score2){
				if(score1.score === score2.score){
					return 0;
				}
				return score2.score - score1.score;
			}
			var id = highscores.length;
			highscores.push({ID:id, name: name, levelReached: level, score: score, date: dateTimeString(new Date())});
			highscores.sort(compare);
			highscores.splice(20); //only keep the top 20!
			var newHighScore = highscores[0].ID === id;
			window.localStorage.setItem("asteroidsjs.highscores", JSON.stringify(highscores));
			this.displayHighscores(highscores, newHighScore, id);
			def.resolve(highscores);
		});	
		return def.promise();
	}
	
	this.getHighScores = function () {
	    return $.ajax({
	        url: "api/score",
	        type: "GET"
	    })
	}
	
	this.getNickname = function(callback){
		var self = this;
		this.displayMessage("Enter Nickname:<div><input id='nickname'/><button id='postScore'>Submit</button></div>", true);
	    var input = document.getElementById("nickname");
	    $("#postScore").one("click", function () {
	        var name = input.value;
	        callback.call(self, name);		
		});
	}

	this.postNewScore = function () {
	    var def = $.Deferred();
	    this.getNickname(function(name){
			var scoreObj = { name: name, score: score, levelReached: level };
	        $.ajax({
	            url: "api/score",
	            type: "POST",
	            data: scoreObj
	        }).done(def.resolve);
		});
	    return def.promise();	    
	}
	
	this.displayHighscores = function (highscores, newHighScore, newScoreId) {
		var html = "<div>Game Over!</div>";
		if(newHighScore){
			html += "<div class='newHighScore'>NEW HIGH SCORE!!</div>";
		}
		html +=
		"<table id='highscoresTable'>" +
            "<tbody>" +
			"<tr><th>Name</th><th>Score</th><th>Level</th><th>Date</th></tr>";

		for(var i = 0; i < highscores.length; i++){
			var aScore = highscores[i];
			if(aScore.ID === newScoreId){
				html += "<tr class='playerScore'>";
			}
			else{
				html += "<tr>";
			}
		    //"2014-04-29T20:22:09.62"			
			var dateTime = dateTimeString(new Date(aScore.date));
			html += "<td class='name'>" + aScore.name + "</td>";
			html += "<td class='score'>" + aScore.score + "</td>";
			html += "<td class='level'>" + aScore.levelReached + "</td>";
			html += "<td class='date'>" + dateTime + "</td>";
			html += "</tr>";
		}		
		html += 
			"</tbody>"
		"</table>";
		this.displayMessage(html);
	}
	
	this.displayMessage("Press Enter to Start");
	
	return this;
}
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
				  window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
if(!window.requestAnimationFrame){
	window.requestAnimationFrame = function(callback){
		setTimeout(callback, 16);
	}
}
if(!window.localStorage){
	(function(){
		var store = {};
		window.localStorage = {
			getItem : function(key){
				return store[key];
			},
			setItem : function(key, value){
				store[key] = value;
			}
		};
	})();
}
////////////////////////////////////////////////
//  Utility functions
///////////////////////////////////////////////

function contains(array, obj){
	for(var i = 0; i < array.length; i++){
		if(array[i] === obj){
			return i;
		}
	}
	return -1;
}
				  
function distance(p1, p2){
	return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
}

function midpoint(p1, p2){
	return {x: (p2.x + p1.x) / 2, y: (p2.y + p1.y) / 2};
}

function pythagorean(a, b){
	return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
}

function normalizeAngle(angle, radians){
	var max = 360;
	if(radians){
		max = (Math.PI * 2);
	}
	if(angle < 0){
		angle = angle + max;
	}
	return angle % max;					
}

function scaleVector(r_angle, magnitude){
	return {x: Math.cos(r_angle)*magnitude, y: Math.sin(r_angle)*magnitude};
}

function vectorAdd(/*p1, p2...*/){
	var x;
	var y;
	for(var i = 0; i < arguments.length; i++){
		if(x == null || y == null){
			x = arguments[i].x;
			y = arguments[i].y;
		}
		else{
			x += arguments[i].x;
			y += arguments[i].y;
		}
	}
	return {x: x, y: y};
}

//p1 - p2
function vectorSubtract(/* p1, p2 ...*/){
	var x;
	var y;
	for(var i = 0; i < arguments.length; i++){
		if(x == null || y == null){
			x = arguments[i].x;
			y = arguments[i].y;
		}
		else{
			x -= arguments[i].x;
			y -= arguments[i].y;
		}
	}
	return {x: x, y: y};
}

function connectTheDots(ctx, dots){
	if(!dots || dots.length < 2){
		return;
	}
	ctx.beginPath();
	for(var i = 0; i < dots.length + 1; i++){
		if(i == 0){
			ctx.moveTo(dots[i].x, dots[i].y);
		}
		else if(i == dots.length){
			ctx.lineTo(dots[0].x, dots[0].y);
			break;
		}
		else{
			ctx.lineTo(dots[i].x, dots[i].y);
		}
		//ctx.fillText(i, dots[i].x + 5, dots[i].y + 5);
	}	
	ctx.stroke();
	
}

//a = iso sides, b = base
function isoAltitude(a, b){
	return Math.sqrt(Math.pow(a, 2) - (Math.pow(b, 2) / 4));
}

function randomInt(min, max){
	if(min === undefined){
		min = 0;
	}
	if(max === undefined){
		max = 10;
	}
	var range = max - min;
	return Math.floor((Math.random() * range)) + min;
}

function randomFloat(min, max){
	if(min === undefined){
		min = 0;
	}
	if(max === undefined){
		max = 10;
	}
	var range = max - min;
	return (Math.random() * range) + min;	
}

function toDegrees(radians){
	return (radians / Math.PI) * 180;
}

function toRadians(degrees){
	return (degrees / 180) * Math.PI;
}

function getArcCoordinates ( x, y, degAngle, radius){
	//90 returns x = 0, y = 1;
	if(radius === undefined){
		radius = 1;
	}
	return {
		x: x + (Math.cos(toRadians(degAngle)) * radius),
		y: y + (Math.sin(toRadians(degAngle)) * radius)
	};
}

////////////////////////////////////////////////
//  Initialize the game
///////////////////////////////////////////////


var space = document.getElementById("space");
space.height = 670;
space.width = 1080;
var game = new Game(space);
