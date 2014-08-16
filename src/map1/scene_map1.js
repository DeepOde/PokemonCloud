/*SCENES: MAP1*/

Crafty.scene("map1", function()
	{
		Crafty.background("#000");
		//Load a background map
		var worldBkg = Crafty.e("2D, DOM, Image")
		worldBkg.attr({  w:1280, h:1280, x: 0, y: 0 })
		worldBkg.image("http://opengameart.org/sites/default/files/Arkanos.png", "no-repeat");
		//worldBkg.image("spriteCave/DS - Pokemon BlackWhite 2 - Hero M");
		//found at: http://opengameart.org/content/mage-city-arcanos
			//Create a basic player sprite
		playerRef = Crafty.e("Player");
		pl = playerRef;
			//bind some keyboard events to the player entity
		playerRef.bind("EnterFrame", function() //KeyDown
			{
				if (playerRef.isDown('LEFT_ARROW') && (!pl.isMoving) && (!pl.isPlaying('PlayerMovingLeft')) && (!pl.isPlaying('PlayerMovingRight')) && (!pl.isPlaying('PlayerMovingUp')) && (!pl.isPlaying('PlayerMovingDown'))) { 
				pl.isMoving = true;
				pl.animate('PlayerMovingLeft', 2, 1);
				setInterval(pl.moveLeft(), 1000);
				pl.isMoving = false;
			}		
			else if (playerRef.isDown('RIGHT_ARROW')) 
			{  playerRef.moveRight();
			}
			else if (playerRef.isDown('UP_ARROW')) {  
				playerRef.moveUp();
			}
			else if (playerRef.isDown('DOWN_ARROW')) { 
				playerRef.moveDown();
			}        
		});
			Crafty.viewport.clampToEntities = false;
			Crafty.viewport.centerOn(playerRef,0);
			Crafty.viewport.follow(playerRef, 0, 0);
	
	});
	