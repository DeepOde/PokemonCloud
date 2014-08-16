/*LOADING SCRIPT - UNIVERSAL*/

Crafty.scene("Loading", function() {
	
	Crafty.e('2D, DOM, Text')
		.text("Loading.....")
		.attr({ x: 200, y: 200, w: 50, h: 50 });
			
	
	Crafty.load(['spriteCave/spr_sheet1.png'], function(){                     //<--------
																		  //         |
    Crafty.sprite(32, 'spriteCave/spr_sheet1.png', {                           //<----------->This addresses have to be further edited by PHP SCRIPT
      spr_player:  [0, 0]
    });
 
	Crafty.scene("map1");
	})

	});
	