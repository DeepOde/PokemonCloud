Crafty.c('Actor', {
  init: function() {
    this.requires('2D, DOM, Grid');
  }
});

/*
Crafty.c('Tree', {
  init: function() {
//    this.requires('Actor, Solid, spr_tree')
  this.requires('Actor, Solid, Color')
     .color('rgb(0,200,0)');
  },
});

Crafty.c('Grass', {
  init: function() {
//    this.requires('Actor, Solid, spr_bush')
  this.requires('Actor, Color, Collision')
     .color('rgb(0,250,0)')
     .onHit('Player', this.ongrass)
     .attr({z: -1});
  },
     
  ongrass: function() {
    putMessage("You are walking on a grass!!!");
  }
});
*/

Crafty.c('Player', {
  init: function() {
	  this.requires("Actor, Keyboard, Collision, spr_player, SpriteAnimation")
	    .attr({x: 30*16, y: 30*16, w: 32, h: 32})
		//.image("http://www.lorestrome.com/trash/oldgamefiles/steamy.gif", "no-repeat")
        .stopOnSolids()
		//.onHit('Grass', this.showTheGrassMessage);
		.animate('PlayerMovingUp',   0, 0, 2)
		.animate('PlayerMovingDown', 1, 1, 2)
        .animate('PlayerMovingLeft', 2, 1, 6)
        .animate('PlayerMovingRight',3, 3, 2);
		
	    var animation_speed = 8; //not connected right now
		var isMoving = false;
  },

  stopOnSolids: function() {
    this.onHit('Solid', this.stopMovement);

    return this;
  },
  // It looks like it's moving too fast
  // And it moves in strange ways :/
  
  //WRKING HERE
  moveLeft: function() {
	for (i=0; i<8; i++) {
	  this.x=this.x-4;
	};//WORKING HERE NEW
	this.borderCheck();
  },
  
  moveRight: function() {
	this.x=this.x+32;  
	this.borderCheck();
  },
  
  moveUp: function() {
	this.y=this.y-32;  
	this.borderCheck();
  },
  moveDown: function() {
	this.y=this.y+32;  
	this.borderCheck();
  },   
  
  borderCheck: function() {
		if (this.x < 0){  this.x = 0  } else  //west check
        if (this.x > 1248) {  this.x = 1248  }  //east check
        if (this.y < 0){  this.y = 0  } else  //north check
        if (this.y > 1248) {  this.y = 1248  }  //south check
	},

/*  showTheGrassMessage: function() {
    if (blablabla) {
      for (var i=0; i < 8; i++) {
      document.getElementById('DivWithScroll').innerHTML += "Hi, did you notice? You just went into grass!!!";
      blablabla = false;
      setScrollBarToBottom();
      };
    } 
  },*/

  stopMovement: function() {
    this._speed = 0;
    if (this._movement) {
      this.x -= this._movement.x;
      this.y -= this._movement.y;
    }
  }
});

$(document).keypress(function(event){
                var keycode = (event.keyCode ? event.keyCode : event.which);
                if(keycode == '13'){
                    loadEnter();
                }
            });