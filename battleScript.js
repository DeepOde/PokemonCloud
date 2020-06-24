/**

	YOU ARE SOLELY RESPONSIBLE AT YOUR OWN IF YOU USE THIS SCRIPT AND CREATOR OF THIS SCRIPT IS NOT 
	RESPONSIBLE FOR ANY TYPE OF USE OF THIS SCRIPT. 
	
	I DONT OWN POKEMON.
	
	Things which are remaining:
	all functions are created except last two, all of them can work almost bug free. Needs function that handles all function by calling them.
	
	Some moves, abilities, weather and other then damage effects are not used.
	
*/


/*NOTE : INCLUDE jQuery */

/*AJAX EXAMPLE STARTS HERE: var xmlhttp;
function loadXMLDoc(url,cfunc)
{
if (window.XMLHttpRequest)
  {// code for IE7+, Firefox, Chrome, Opera, Safari
  xmlhttp=new XMLHttpRequest();
  }
else
  {// code for IE6, IE5
  xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
xmlhttp.onreadystatechange=cfunc;
xmlhttp.open("GET",url,true);
xmlhttp.send();
}
function getUFD() {
loadXMLDoc("<name>.php?f=1&nid="+foe.nid,function()
  {
  if (xmlhttp.readyState==4 && xmlhttp.status==200)
    {
    var UFDstirng =xmlhttp.responseText;
    var UFDarray = UFDstring.split(",");
    foe.height = UFDarray[0];
    foe.weight = UFDarray[1];
    foe.baseHp = UFDarray[2];
    foe.baseAtt = UFDarray[3];
    foe.baseDef = UFDarray[4];
    foe.baseSpAtt = UFDarray[5];
    foe.baseSpDef = UFDarray[6];
    foe.baseSpeed = UFDarray[7];
    
    }
  });
} : AJAX example ends here */

var totalTurns = 0; //at start set at 0, at start of every turn +=1
var trickRoom = false;
var weather = 0;
var gravity = false;
var waterSport = new Array();
waterSport[0] = false; //index 0 checks if it is set or not
waterSport[1] = -1; //index 1 tracks that by which side waterSport was sat, -1 = not sat, 0 = by userside, 1 = by foeside
waterSport[2] = -1; //index 2 tracks that by which index of pokemon in respective side which sat warterSport, -1 = not sat, 0-5 = indices
var mudSport = new Array();
waterSport[0] = false; //index 0 checks if it is set or not
waterSport[1] = -1; //index 1 tracks that by which side waterSport was sat, -1 = not sat, 0 = by userside, 1 = by foeside
waterSport[2] = -1; //index 2 tracks that by which index of pokemon in respective side which sat warterSport, -1 = not sat, 0-5 = indices

var selected = 0; //index of selected pokemon inside party, by default it is 0 as we want to send first pokemon in party in battle first, used as global because several checks are already assigned with variable selected
var foeSelected = 0; //used as global because several checks are already assigned with variable selected

function applyMod(base, modi) {                             //applies modifier, check smogon and u will know that, its needed at almost all times.
  var toReturn = round((base * modi) / 0x1000);
  return toReturn;
}
function applyMultiplier(rawstate, s) {
    var m = Math.max(2, 2 + s)/Math.max(2, 2 - s);
    var toReturn = Math.floor(rawstate*m);
    return toReturn;
}

function hasChance(perc) {                                 //its like "luck-decider", returns true or false on base of..hmm..luck (ok, k, k, on base of %)
    var x = Math.floor(Math.random()*100)+1;
    if (perc > x) {
        return true;
    }
    else {
        return false;
    }
}
function setStat(statcode,BaseStat,IV,EV,Level,nature) {
//follows http://www.dragonflycave.com/stats.aspx, hardy = 0, lonely = 1, brave = 2 and so on

    var Nature = 1;                //nature doesn't equals Nature
    if (statcode == 1) { //attack stat
        if ((nature == 1) || (nature == 2) || (nature == 3) || (nature == 4)) {
            Nature = 1.1;
        }
        else if ((nature == 6) || (nature == 11) || (nature == 16) || (nature == 21)) {
            Nature = 0.9;
        }
    }
    else if (statcode == 2) { //defense stat
        if ((nature == 6) || (nature == 7) || (nature == 8) || (nature == 9)) {
            Nature = 1.1;
        }
        else if ((nature == 1) || (nature == 12) || (nature == 17) || (nature == 22)) {
            Nature = 0.9;
        }
    }
    else if (statcode == 3) { //spatt stat and not speed stat
        if ((nature == 16) || (nature == 17) || (nature == 18) || (nature == 19)) {
            Nature = 1.1;
        }
        else if ((nature == 3) || (nature == 8) || (nature == 13) || (nature == 24)) {
            Nature = 0.9;
        }
    }
    else if (statcode == 4) {  //spdef stat
        if ((nature == 24) || (nature == 21) || (nature == 22) || (nature == 23)) {
            Nature = 1.1;
        }
        else if ((nature == 4) || (nature == 9) || (nature == 14) || (nature == 19)) {
            Nature = 0.9;
        }
    }
	else if (statcode == 5) { //speed stat and not spatt stat
		if ((nature == 16) || (nature == 17) || (nature == 18) || (nature == 19)) {
			Nature = 1.1;
		}
		else if ((nature == 2) || (nature == 7)|| (nature == 18) || (nature == 23)) {
			Nature = 0.9;
		}
	}
    
    stat = Math.floor(Math.floor(((2 * BaseStat + IV + (EV / 4)) * Level / 100) + 5) * Nature);
    return stat;
}
function sethp(BaseStat,IV,EV,Level) {
    HP = Math.floor((((2 * BaseStat + IV + (EV / 4)) * Level )/ 100 + Level + 10));
    return HP;
}
function User(index, party) { //index referes to index of pokemon in party (in detail : index referes that which element to choose from various party object arrays)
   this.nid = party.nids[index];
   this.form = party.forms[index];
   this.name = pokeName[this.nid][this.form];
   this.item = party.items[index];
   this.gender = party.genders[index];
   this.nature = party.natures[index];
   this.level =  party.levels[index];
   this.hasStatus = party.hasStatuss[index]; //hasStatus has been used as name instead of status because status is javascript core function
   //this.move = new Array();, let combination of moves not be array, it may be hard to deal with 3D arrays, still think about it later, i am just keep move1 as array for now
   this.move1 = party.moves1[index];
   this.move2 = party.moves2[index];
   this.move3 = party.moves3[index];
   this.move4 = party.moves4[index];
   this.ability = party.abilitys[index];
   //can use return values from php script instead loading whole arrays?
   this.height = party.heights[index];
   this.weight = party.weights[index];
   this.baseHp = party.baseHps[index];
   this.baseAtt = party.baseAtts[index];
   this.baseDef = party.baseDefs[index];
   this.baseSpAtt = party.baseSpAtts[index];
   this.baseSpDef = party.baseSpDefs[index];
   this.baseSpeed = party.baseSpeeds[index];
   this.ivHp =  party.ivHps[index];
   this.ivAtt =  party.ivAtts[index];
   this.ivDef =  party.ivDefs[index];
   this.ivSpAtt =  party.ivSpAtts[index];
   this.ivSpDef =  party.ivSpDefs[index];
   this.ivSpeed =  party.ivSpeeds[index];party.nids[index];
   this.evHp = party.evHps[index];
   this.evAtt = party.evAtts[index];
   this.evDef = party.evDefs[index];
   this.evSpAtt = party.evSpAtts[index];
   this.evSpDef = party.evSpDefs[index];
   this.evSpeed = party.evSpeeds[index];
   this.hp = party.hps[index];
   this.att = party.atts[index];
   this.def = party.defs[index];
   this.spatt = party.spatts[index];
   this.spdef = party.spdefs[index];
   this.speed = party.speeds[index];
   this.attLev = 0;
   this.defLev = 0;
   this.spattLev = 0;
   this.spdefLev = 0;
   this.speedLev = 0;
   this.accLev = 0;
   this.eveLev = 0;
   this.moved = false; //whether player moved in this turn or not
   this.happiness = party.happinesss[index];
   this.stockpile = 0; //<--------------------------to be used in move
   this.damage = new Array(); //update party with this.
   this.moves = new Array(); //moves used at various turns, update party with this.
   this.move1pp = party.move1pps[index];
   this.move2pp = party.move2pps[index];
   this.move3pp = party.move3pps[index];
   this.move4pp = party.move4pps[index];
   this.moveAt; //index inside move array
   this.isSureToBeHitted = false;
   this.isSureToHit = false;
   this.isSwitching = false;
   this.canSwitch = true;
   this.byPassive = new Array();
   this.byPassive['meFirst'] = false;
   this.byPassive['helpingHand'] = false;
   this.isCharging = new Array();
   this.beforeTurnDamage = new Array(); //Indirect damage, before turn
   this.afterTurnDamage = new Array(); //Indirect damage, after turn
   this.quickClaw = false;
   this.direHit = false;
   this.direHit2 = 0;
   this.direHit3 = 0;
   this.focusEnergy = false;
   this.transformed = false;
   this.flashfire = false;
   this.criticalHit = false;
   this.trade = 0;
}
//user object ends here
//modify below, edit battle.php
function Party(nid, form, item, gender, nature, level, move1, move2, move3, move4, move1pp, move2pp, move3pp, move4pp, ability, ivHp, ivAtt, ivDef, ivSpAtt, ivSpDef, ivSpeed, evHp, evAtt, evDef, evSpAtt, evSpDef, evSpeed, hp, att, def, spatt, spdef, speed, happiness, hasStatus) {
	this.nids = nid;
	this.forms = form;
	this.items = item;
	this.genders = gender;
	this.natures = nature;
	this.levels =  level;
	this.abilitys = ability;
	this.hasStatuss = hasStatus;
	this.heights = new Array();
	this.weights = new Array();
	this.baseHps = new Array();
	this.baseAtts = new Array();
	this.baseDefs = new Array();
	this.baseSpAtts = new Array();
	this.baseSpDefs = new Array();
	this.baseSpeeds = new Array();
	for (i = 0; i < nid.length; i++) {
    	this.heights[i] = pokeHeight[this.nids[i]][this.forms[i]];
		this.weights[i] = pokeWeight[this.nids[i]][this.forms[i]];
		this.baseHps[i] = pokeBaseHP[this.nids[i]][this.forms[i]];
		this.baseAtts[i]= pokeBaseATT[this.nids[i]][this.forms[i]];
		this.baseDefs[i] = pokeBaseDEF[this.nids[i]][this.forms[i]];
		this.baseSpAtts[i] = pokeBaseSPATT[this.nids[i]][this.forms[i]];
		this.baseSpDefs[i] = pokeBaseSPDEF[this.nids[i]][this.forms[i]];
		this.baseSpeeds[i] = pokeBaseSPEED[this.nids[i]][this.forms[i]];
	}
	this.ivHps =  ivHp;
	this.ivAtts =  ivAtt;
	this.ivDefs =  ivDef;
	this.ivSpAtts =  ivSpAtt;
	this.ivSpDefs =  ivSpDef;
	this.ivSpeeds =  ivSpeed;
	this.evHps = evHp;
	this.evAtts = evAtt;
	this.evDefs = evDef;
	this.evSpAtts = evSpAtt;
	this.evSpDefs = evSpDef;
	this.evSpeeds = evSpeed;
	this.hps = hp;
	this.atts =att;
	this.defs = def;
	this.spatts = spatt;
	this.spdefs = spdef;
	this.speeds = speed; 
	/* following lines are need to be changed, because stats should be calculated AFTER every battle then should be saved in db, then get them as values.
	for (i = 0; i < this.nids.length; i++) {
	   
	  //this.hps[i] = sethp(this.baseHps[i], this.ivHps[i], this.evHps[i], this.levels[i]);
	  this.atts[i] = setStat(1,this.baseAtts[i],this.ivAtts[i],this.evAtts[i],this.levels[i],this.natures[i]);
	  this.defs[i] = setStat(2,this.baseDefs[i],this.ivDefs[i],this.evDefs[i],this.levels[i],this.natures[i]);
	  this.spatts[i] = setStat(3,this.baseSpAtts[i],this.ivSpAtts[i],this.evSpAtts[i],this.levels[i],this.natures[i]);
	  this.spdefs[i] = setStat(4,this.baseSpDefs[i],this.ivSpDefs[i],this.evSpDefs[i],this.levels[i],this.natures[i]);
	  this.speeds[i] = setStat(5,this.baseSpeeds[i],this.ivSpeeds[i],this.evSpeeds[i],this.levels[i],this.natures[i]);
	}
	*/
	
	this.happinesss = happiness; //happiness + s (showing set or plurals)
	
	this.moves1 = move1;
	this.moves2 = move2;
	this.moves3 = move3;
	this.moves4 = move4;
	this.moveId = 0; //Move currently going on, set while using and after use, set back to 0. 
	this.damages = new Array(); //update tis from user instead of updating user with this.
	this.movess = new Array(); //update this from user instead updating user with this. 
	this.move1pps = move1pp;
	this.move2pps = move2pp;
	this.move3pps = move3pp;
	this.move4pps = move4pp;
	this.tookPart = new Array(); //list of pokemon who took part in battle, alter immediately as pokemnon enteres in field.
	this.luckyChant = false;
	this.tailwind = false;
}
function Foeside(nid, form, item, gender, level, move1, move2, move3, move4, hasStatus) {
	this.nids = nid;
	this.forms = form;
	this.items = item;
	this.genders = gender;
	this.natures = new Array();
	this.abilitys = new Array();
	this.levels =  level;
	this.hasStatuss = hasStatus;
	this.heights = new Array();
	this.weights = new Array();
	this.baseHps = new Array();
	this.baseAtts = new Array();
	this.baseDefs = new Array();
	this.baseSpAtts = new Array();
	this.baseSpDefs = new Array();
	this.baseSpeeds = new Array();
	this.ivHps =  new Array();
	this.ivAtts =  new Array();
	this.ivDefs =  new Array();
	this.ivSpAtts =  new Array();
	this.ivSpDefs =  new Array();
	this.ivSpeeds =  new Array();
	this.evHps = new Array();
	this.evAtts = new Array();
	this.evDefs = new Array();
	this.evSpAtts = new Array();
	this.evSpDefs = new Array();
	this.evSpeeds = new Array();
	this.hps =new Array();
	this.atts = new Array();
	this.defs = new Array();
	this.spatts = new Array();
	this.spdefs = new Array();
	this.speeds = new Array();
	this.moves1 = move1;
	this.moves2 = move2;
	this.moves3 = move3;
	this.moves4 = move4;
	this.move1pps = new Array();
	this.move2pps = new Array();
	this.move3pps = new Array();
	this.move4pps = new Array();
	this.happinesss = new Array();
	this.damages = new Array();
	this.movess = new Array(); //this is array is for storing which moves have been used. 
	this.tookPart = new Array(); //list of pokemon who took part in battle, alter immediately as pokemnon enteres in field.
	
	for (i = 0; i < this.nids.length; i++) {
		this.natures[i] = Math.floor((Math.random()*25)+0); //we add 0, we would have added 1 if we didn't want to include 0 but we need to set value between 0 and 24
		if (typeof pokeAbilityT[this.nids[i]][this.forms[i]] !== 'undefined') { //checks if pokemon do have second ability.
			this.abilityAt = Math.floor((Math.random()*2)); //to choose random ability, chooses random number from 0 & 1
			if (this.abilityAt == 0) { //choose first ability
				this.abilitys[i] = pokeAbilityO[this.nids[i]][this.forms[i]];
			}
			else {
				this.abilitys[i] = pokeAbilityT[this.nids[i]][this.forms[i]];
			}
		}
		else {
			this.abilitys[i] = pokeAbilityO[this.nids[i]][this.forms[i]]; //else it has only single ability, sets it to it.
		}
		this.heights[i] = pokeHeight[this.nids[i]][this.forms[i]];
		this.weights[i] = pokeWeight[this.nids[i]][this.forms[i]];
		this.baseHps[i] = pokeBaseHP[this.nids[i]][this.forms[i]];
		this.baseAtts[i] = pokeBaseATT[this.nids[i]][this.forms[i]];
		this.baseDefs[i] = pokeBaseDEF[this.nids[i]][this.forms[i]];
		this.baseSpAtts[i] = pokeBaseSPATT[this.nids[i]][this.forms[i]];
		this.baseSpDefs[i] = pokeBaseSPDEF[this.nids[i]][this.forms[i]];
		this.baseSpeeds[i] = pokeBaseSPEED[this.nids[i]][this.forms[i]];
		this.ivHps[i] = Math.floor((Math.random()*31)+1); //sets ivs randomly from range of 1 to 31, both inclusive
		this.ivAtts[i] = Math.floor((Math.random()*31)+1);
		this.ivDefs[i] = Math.floor((Math.random()*31)+1);
		this.ivSpAtts[i] = Math.floor((Math.random()*31)+1);
		this.ivSpDefs[i] = Math.floor((Math.random()*31)+1);
		this.ivSpeeds[i] = Math.floor((Math.random()*31)+1);
		//for wild pokemons, ev's are always set to 0
		this.evHps[i] = 0; 
		this.evAtts[i] = 0;
		this.evDefs[i] = 0;
		this.evSpAtts[i] = 0;
		this.evSpDefs[i] = 0;
		this.evSpeeds[i] = 0;
		this.hps[i] = sethp(this.baseHps[i],this.ivHps[i],this.evHps[i],this.levels[i]);
		this.atts[i] = setStat(1,this.baseAtts[i],this.ivAtts[i],this.evAtts[i],this.levels[i],this.natures[i]);
		this.defs[i] = setStat(2,this.baseDefs[i],this.ivDefs[i],this.evDefs[i],this.levels[i],this.natures[i]);
		this.spatts[i] = setStat(3,this.baseSpAtts[i],this.ivSpAtts[i],this.evSpAtts[i],this.levels[i],this.natures[i]);
		this.spdefs[i] = setStat(4,this.baseSpDefs[i],this.ivSpDefs[i],this.evSpDefs[i],this.levels[i],this.natures[i]);
		this.speeds[i] = setStat(5,this.baseSpeeds[i],this.ivSpeeds[i],this.evSpeeds[i],this.levels[i],this.natures[i]);
		this.happinesss[i] = 70; //always 70, happiness + s = showing plural or set or array.
		this.move1pps[i] = movePP[move1[i]];
		this.move2pps[i] = movePP[move2[i]];
		this.move3pps[i] = movePP[move3[i]];
		this.move4pps[i] = movePP[move4[i]];
	}
	this.luckyChant = false;
	this.tailwind = false;
}
party = new Party([1],[0],[0], [1],[1],[5],[33],[22],[0],[0],[20],[20],[0],[0],[63],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[0],[30],[30],[30],[30],[30],[30],[200],[0])
user = new User(0, party);
foeside = new Foeside([7], [0], [0], [1], [5], [33], [61], [0],[0], [0]);
foe = new User(0, foeside);
player = {
    badge : 5
}

function calculateSpeed(a, aside) {
	calcSpeed = a.speed;
    calcSpeed = applyMultiplier(a.speed, a.speedLev);
    if ((a.hasStatus == 1) && (a.ability != 95)) {
        calcSpeed = Math.round(calcSpeed/4);
    }
    if (a.item == 5 ) {
        calcSpeed = Math.round(calcSpeed*1.5);
    }
    if ((a.item == 212) ||(a.item == 163) ||(a.item == 167) ||(a.item == 168) ||(a.item == 169) ||(a.item == 170) ||(a.item == 171) ||(a.item == 172)) {
        calcSpeed = Math.round(calcSpeed/2);
    }
    if (aside.tailwind) {
        calcSpeed = Math.round(calcSpeed*2);
    }
    if ((a.nid = 192) && (a.transformed == false) && (a.item == 24 )) {
        calcSpeed = Math.round(calcSpeed*2);
    }
    if (((a.ability == 33) && (weather == 2)) || ((a.ability == 34) && (weather == 1)) || ((a.ability == 146) && (weather == 3))) {
        calcSpeed = Math.round(calcSpeed*2);
    } 
    if ((a.ability == 84) && (aside.items[selectedAt] != 0) && (a.item == 0)) {
        calcSpeed = Math.round(calcSpeed*2);
    }
    if ((a.ability == 95) && ((a.hasStatus == 1) || (a.hasStatus == 2) || (a.hasStatus == 3) || (a.hasStatus == 4) || (a.hasStatus == 5))) {
        calcSpeed = Math.round(calcSpeed*1.5);
    }
	return calcSpeed;
	/*
    if (user.ability == /*slow start) {*/
        /*yet to figure out <--------------------------------------------------------------------------------------------------------
    } */
    //==========
}
function priLevel(a, aside, b, bside) {                                           //priority level
    a.calcSpeed = calculateSpeed(a, aside);
	b.calcSpeed = calculateSpeed(b, bside);
    if (movePri[a.moveId] > movePri[b.moveId]) {
        return "u";                
    }
    else if (movePri[a.moveId] < movePri[b.moveId]) {
        return "f";
    }
    else { //same pri level, checks excludes: prankster, gale wings and is made for single battles only.
        if ((a.item == 180) && (hasChance(20))) {
          var actiQC_u = true;
        } 
        if ((b.item == 180) && (hasChance(20))) {
          var actiQC_f = true;
        }
		if ((actiQC_u) && (actiQC_f)) {
            if (a.speed > b.speed) {
                return "u";
            }
            else if (a.speed < b.speed){
                return"f";
            }
            else {
                var randomvartoselspe = Math.floor(Math.random()*1);
                if (randomvartoselspe == 0) {
                    return "u";
                } else {
                    return "f";
                }
            }
        }
        else if (actiQC_u) {
            return "u";
        }
        else if (actiQC_f) {
            return "f";
        }
        if ((a.item) == 365 && (a.hp <= ((sethp(a.baseHp, a.ivHp, a.evHp, a.level))/4))) {
          consumeBerry(a);     
          var actiCB_u = true;
        } 
        if ((b.item) == 365 && (b.hp <= ((sethp(b.baseHp, b.ivHp, b.evHp, b.level))/4))) {
          consumeBerry(b);
          var actiCB_f = true;
        }
		if ((actiCB_u) && (actiCB_f)) {
            if (a.speed > b.speed) {
                return "u";
            }
            else if (a.speed < b.speed){
                return"f";
            }
            else {
                var randomvartoselspe = Math.floor(Math.random()*1);
                if (randomvartoselspe == 0) {
                    return "u";
                } else {
                    return "f";
                }
            }
        }
        else if (actiCB_u) {
            return "u";
        }
        else if (actiCB_f) {
            return "f";
        }
        if ((a.item == 11) || (a.item == 13)) {
            var actiLT_u = true;
        }
        if ((b.item == 11) || (b.item == 13)) {
            var actiLT_f = true;
        }
		if ((actiLT_u) && (actiLT_f)) {
            if (a.speed < b.speed) {
                return "u";
            }
            else if (a.speed > b.speed){
                return"f";
            }
            else {
                var randomvartoselspe = Math.floor(Math.random()*1);
                if (randomvartoselspe == 0) {
                    return "u";
                } else {
                    return "f";
                }
            }
        }
        else if (actiLT_f) {
            return "u";
        }
        else if (actiLT_u) {
            return "f";
        }
        if (a.ability == 100) {
            var actiStall_u = true;
        }
        if (b.ability == 100) {
            var actiStall_f = true;
        }
		if ((actiStall_u) && (actiStall_f)) {
			if (a.speed < b.speed) {
                return "u";
            }
            else if (a.speed > b.speed){
                return"f";
            }
            else {
                var randomvartoselspe = Math.floor(Math.random()*1);
                if (randomvartoselspe == 0) {
                    return "u";
                } else {
                    return "f";
                }
            }
        }
		else if (actiStall_u) {
			return "f";
		}
		else if (actiStall_f) {
			return "u";
		}
        
		if (a.speed > b.speed) {
            if (trickRoom) {
                return "f";
            }
            else {
                return "u";
            }
        }
        else if (a.speed < b.speed) {
            if (trickRoom) {
                return "u";
            }
            else {
                return "f";
            }
        }
        else if (a.speed == b.speed) {
            var randomvartoselspe = Math.floor(Math.random()*1);
                if (randomvartoselspe == 0) {
                    return "u";
                } else {
                    return "f";
                }
        }
    }
} //priority level counting function ends here
function obedCheck(player, user) {                                          //obedience check
     if (player.badge == 0) {
        if ((user.level > 10) && (user.trade == 1)) {
            return false;
        }
    }
     if (player.badge == 1) {
        if ((user.level > 20) && (user.trade == 1)) {
            return false;
        }
    }
    if (player.badge == 2) {
        if ((user.level > 30) && (user.trade == 1)) {
            return false;
        }
    }
     if (player.badge == 3) {
        if ((user.level > 40) && (user.trade == 1)) {
            return false;
        }
    }
     if (player.badge == 4) {
        if ((user.level > 50) && (user.trade == 1)) {
            return false;
        }
    }
     if (player.badge == 5) {
        if ((user.level > 60) && (user.trade == 1)) {
            return false;
        }
    }
     if (player.badge == 6) {
        if ((user.level > 70) && (user.trade == 1)) {
            return false;
        }
    }
     if (player.badge == 7) {
        if ((user.level > 80) && (user.trade == 1)) {
            return false;
        }
    } if (player.badge == 8) {
        return true;
    }
	return true;
} //obedience check for traded pokemon(s) ends here
function accCheck(a, aside, b, bside, moveId) {                 //accuracy check
    var baseAcc;
    /*returning true if its move which never misses*/
    if (moveAcc[moveId] < 100) {
        return true;
    }
    /*if its status move and target has wonder skin, set accuracy to 50
      else to base accuracy of the move*/
    if ((b.ability == 147) && (moveDamageClass[moveId] == 0)) {
        baseAcc = 50;
    }
    else {
        baseAcc = moveAcc[moveId];
    }
    /*subtract evasion of target from accuracy of user*/
    var modifiedLev = a.accLev - b.eveLev;  
    /*cap the result between 6 and -6*/
    if (modifiedLev < -6) {
        modifiedLev = -6;
    }
    if (modifiedLev > 6) {
        modifiedLev = 6;
    }
    var acc=applyMultiplier(baseAcc, modifiedLev);
    if ((b.item == 3) || (b.item == 14)) {
        acc = Math.round(acc*0.9);
    }
    if (a.item == 38) {
        acc = Math.round(acc*1.1);
    }
    if (a.item == 41) {
        acc = Math.round(acc*1.2);
    }
    if (a.ability == 14) {
        acc = Math.round(acc*1.3);
    }
    /* NOT SUPPORTED YET: VICTORY STAR ABILITY::: if (a.ability == "placholder") {
        acc = Math.round(acc*1.1);
    }*/
    if (((b.ability == 8) && (weather == 3)) || ((b.ability == 81) && (weather == 4))) {
        acc = Math.round(acc*0.8);
    }
    if ((a.ability == 55) && (moveDamageClass[moveId] == 1)) {
        acc = Math.round(acc*0.8);
    }
    if ((b.ability == 77) && (b.hasStatus == 6)) {
        acc = Math.round(acc/2);
    }
    if (gravity) {
        acc = Math.round(acc*(10/6));
    }
    if (acc > 100) {
        acc = 100;
    }
    var randomchecker = Math.floor(Math.random()*99)+1;
    if (randomchecker < acc) {
        return true;
    }
    else {
        return false;
    }
}
function criHit(a, aside, b, bside, moveId) {                   //critical hit check
    if ((b.ability == 75) || (b.ability == 4) || (bside.luckyChant == true)) {
        return false;
    }
    if ((moveId == 480) || (moveId == 524)) {
        return true;
    }
    var c = 0;
    var chratio;
    if (((a.nid == 83) && (a.item == 164)) || ((a.nid == 113) && (a.item == 156))) {
        c += 2;
    }
    c += moveCriRat[moveId];
    if ((a.focusEnergy) || (a.direHit)) {
        c += 2;
    }
    if (a.direHit2 == 1) {
        c += 1;
    }
    else if (a.direHit2 > 1) {
        c += 2;
    }
    if (a.direHit3 > 0) {
        c += 2;
    }
    if (a.ability == 105) {
        c += 1;
    }
    if ((a.item == 125) || (a.item == 181)) {
        c += 1;
    }
    if (c >= 4) {
        c = 4;
    }
    switch (c) {
        case 0: 
            chratio = 16;
            break;
        case 1:
            chratio = 8;
            break;
        case 2: 
            chratio = 4;
            break;
        case 3: 
            chratio = 3;
            break;
        case 4:
            chratio = 2;
            break;        
    }
    return hasChance(100/(chratio));
    
}
function countBasePower(moveId, atIndex, a, aside, b, bside) {  //moves whose base power are not counted by regular method
     var exception = [218, 216, 371, 486, 419, 360, 284, 386, 210, 67, 447, 497, 506, 378, 372, 484, 500, 512, 175, 179, 376, 496, 167, 358, 265, 311, 16, 239,251, 237, 255, 228, 217, 363, 222, 205, 374, 518, 519, 520];
     var basePower = movePower[moveId];
     var md = 0;
     if ($.inArray(moveId, exception) != -1) { //move is in exception array which means that its base power should not be counted as regular.
       basePower = countBasePowerException(moveId, atIndex, a, aside, b, bside);
     }
     md = basePower;
     if ((a.ability == 101) && (movePower[moveId] <= 60)) {
       md = applyMod(md, 0x1800); //md stands for "modified damage"
     }
     if ((a.ability == 138) && (a.hasStatus = 4) && (moveDamageClass[moveId] == 2)) {
       md = applyMod(md, 0x1800); //md stands for "modified damage"
     }
     if ((a.ability == 148) && ((moveId != 353) || (moveId != 248)) && (b.moved == true)){
       md = applyMod(md, 0x14cd); //md stands for "modified damage"
     }
     if ((a.ability == 120) && ((moveRecoil[moveId] < 0) || (moveId == 26) || (moveId == 136))) {
       md = applyMod(md, 0x1333); //md stands for "modified damage"
     }
     if ((a.ability == 89) && (moveFlag[moveId].indexOf("j")))  { //second if condition checkes if move is punching move *NOTE*:2ND CONDITION DOESN'T SEEMS TO BE RIGHT....
       md = applyMod(md, 0x1333); //If the ability is Iron Fist and user of move, used or gonna use punching move
     } 
     if ((a.ability == 137) && (a.hasStatus == 5) && (moveDamageClass[moveId] == 1)) {
       md = applyMod(md, 0x1800);
     }
     if (a.ability == 79) {
       if ((a.gender == 2) || (b.gender == 2)) { //0 : Male Pokemon, 1: Female Pokemon, 2: Genderless pokemon
         md = applyMod(md, 0x1000);
       }
       else if(a.gender == b.gender) {
         md = applyMod(md, 0x1400);
       }
       else {
          md = applyMod(md, 0xC00);
       }
     }
     if ((a.ability == 159) && ((moveType[moveId] == 4) || (moveType[moveId] == 5) || (moveType[moveId] == 8))) {
       md = applyMod(md, 0x14cd);
     }
     if ((b.ability == 85) && (moveType[moveId] == 9)) {
       md = applyMod(md, 0x800);
     }
     if ((b.ability == 87) && (moveType[moveId] == 9)) {
      md = applyMod(md, 0x1400);
     }
    
     if(((moveType[moveId] == 1) && (a.item == 48)) ||((moveType[moveId] == 9) && (a.item == 57)) ||((moveType[moveId] == 15) && (a.item == 165)) ||((moveType[moveId] == 5) && (a.item == 206)) ||((moveType[moveId] == 12) && (a.item == 95)) || ((moveType[moveId] == 8) && (a.item == 101)) ||((moveType[moveId] == 11) && (a.item == 103)) ||((moveType[moveId] == 10) && (a.item == 106)) ||((moveType[moveId] == 14) && (a.item == 107)) || ((moveType[moveId] == 3) && (a.item == 166)) || ((moveType[moveId] == 2) && (a.item == 158)) || ((moveType[moveId] == 0) && (a.item == 31)) || ((moveType[moveId] == 6) && (a.item == 32)) || ((moveType[moveId] == 4) && (a.item == 34)) || ((moveType[moveId] == 7) && (a.item == 132)) || ((moveType[moveId] == 13) && (a.item == 142)) || ((a.nid == 483) && (a.item == 159) && ((moveType[moveId] == 15) || (moveType[moveId] == 8))) || ((a.nid == 484) && (a.item == 162) && ((moveType[moveId] == 15) || (moveType[moveId] == 10))) || ((a.nid == 487) && (a.item == 213) && ((moveType[moveId] == 15) || (moveType[moveId] == 7)))) {
       md = applyMod(md, 0x1333); //covered things : type-enhancing items, plates and incences                                                    
     }
     if ((a.item == 19) && (moveDamageClass[moveId] == 1)) {
       md = applyMod(md, 0x1199); //mucle band
     }
     if ((a.item == 39) && (moveDamageClass[moveId] == 2)) {
       md = applyMod(md, 0x1999); //wise glasses
     }
     if (((moveType[moveId] == 0) && (a.item == 59)) || ((moveType[moveId] == 1) && (a.item == 248)) ||((moveType[moveId] == 2) && (a.item == 251)) ||((moveType[moveId] == 3) && (a.item == 249)) ||((moveType[moveId] == 4) && (a.item == 250)) ||((moveType[moveId] == 5) && (a.item == 254)) ||((moveType[moveId] == 6) && (a.item == 253)) ||((moveType[moveId] == 7) && (a.item == 255)) ||((moveType[moveId] == 8) && (a.item == 258)) ||((moveType[moveId] == 9) && (a.item == 243)) ||((moveType[moveId] == 10) && (a.item == 244)) ||((moveType[moveId] == 11) && (a.item == 246)) ||((moveType[moveId] == 12) && (a.item == 245)) ||((moveType[moveId] == 13) && (a.item == 252)) ||((moveType[moveId] == 14) && (a.item == 247)) ||((moveType[moveId] == 15) && (a.item == 256)) ||((moveType[moveId] == 16) && (a.item == 257))) {
       md = applyMod(md, 0x1800); //gems 
     }
     if ((moveId == 263) && ((a.hasStatus == 1) || (a.hasStatus == 4) || (a.hasStatus == 5))) {
       md = applyMod(md, 0x2000); //facade
     }
     if ((moveId == 362) && (b.hp <= 50)) {
       md = applyMod(md, 0x2000); 
     }
     if ((moveId == 474) && (b.hasStatus == 5)) {
       md = applyMod(md, 0x2000);
     }
     if ((moveId == 514) && ((bside.faintedAt[0] == totalTurns-1 ) || (bside.faintedAt[1] == totalTurns-1 ) || (bside.faintedAt[2] == totalTurns-1 ) || (bside.faintedAt[3] == totalTurns-1 ) || (bside.faintedAt[4] == totalTurns-1 ) || (bside.faintedAt[5] == totalTurns-1 ) )) {
       md = applyMod(md, 0x2000); //yet to make bside....
     }
     if ((moveId == 558) && (a.moves[totalTurns-1] == 559)) {
       md = applyMod(md, 0x2000);
     }
     if ((moveId == 559) && (a.moves[totalTurns-1] == 558)) {
       md = applyMod(md, 0x2000);
     }
     if (a.byPassive['meFirst']) {
       md = applyMod(md, 0x1800);
     }
     if ((moveId == 76) && (weather != 0) && (weather != 1)) { //weather meaning : 0 = default weather, 1 = intense sunlight, 2 = rain (any type), 3 = sandstorm, 4: hail
       md = applyMod(md, 0x800);
     }
     
     if ((a.moves[totalTurns-1] == 268) && (moveType[moveId] == 12)) {
       md = applyMod(md, 0x2000);
     }
     if (a.byPassive['helpingHand']) {
      md = applyMod(md, 0x1800);
     }
     if ((waterSport == true) && (moveType[moveId] == 9)) { //NEED TO CHECK IF USER POKEMON IS STILL ON FIELD OR WE CAN reASSIGN IT ONCE USER SWITCHES OR FAINTS
       md = applyMod(md, 0x548);
     }
     if ((mudSport == true) && (moveType[moveId] == 12)) { //NEED TO CHECK IF USER POKEMON IS STILL ON FIELD OR WE CAN reASSIGN IT ONCE USER SWITCHES OR FAINTS
       md = applyMod(md, 0x548);
     }
return md;
}//base power counting function ends here
function countBasePowerException(moveId, atIndex, a, aside, b, bside) { //for calculating base power of those moves which have different base power calculation
var umd= 0; //umd stands for un modified damage

  if (moveId == 218) {
    umd == (((225 - a.happiness) * 10) / 25 );
    if (umd == 0) {
      umd = 1;
    }
    return umd;
  }
  else if (moveId == 216) {
    umd = ((a.happiness * 10) / 25);
    if (umd == 0) {
     umd = 1;
     }
  return umd;
  }
  else if (moveId == 371) {
    if (b.moved == true) {
      umd = 100;
    }
    else {
      umd = 50;
    }
    return umd;
  }
  else if(moveId == 486) {
    var s = calculateSpeed(a, aside)/ calculateSpeed(b, bside) //CALCULATED SPEEDS TO BE USED
    if (s >= 4) {
      umd = 150;
      return umd;
    }
    else if ((3 <= s) && (s < 4)) {
      umd = 120;
      return umd;
    }
    else if ((2 <= s) && (s < 3)) {
      umd = 80;
      return umd;
    }
    else if((1 <= s) && (s < 2)) {
      umd = 60;
      return umd;
    }
    else {
      umd = 40;
      return umd;
    }
  }
  
  else if(moveId == 419) {
    if(a.damage[totalTurns] == 0) {
      umd = 60;
      return umd;
    }
    else {
      umd = 120;
      return umd;
    }
  }
  else if(moveId == 360) {
    umd = Math.min(150, 25*b.speed/a.speed); //ACTUAL SPEEDS TO BE USED
    return umd;  
  }
  else if((moveId == 284) || (moveId == 323)) {
    var maxhp = sethp(a.baseHP,a.ivHp,a.evHp,a.level);
    umd = (150*a.hp)/maxhp; //calculating sethp() will give us max hp which pokemon can have. USER'S HP TO BE USED
    return umd;
  }
  else if(moveId == 386) {
    var userStat = 0;
    if (a.attLev >= 0) {
      userStat += a.attLev;
    }
    if (a.defLev >= 0) {
      userStat += a.defLev;
    }
    if (a.spattLev >= 0) {
      userStat += a.spattLev;
    }
    if (a.spdefLev >= 0) {
      userStat += a.spdefLev;
    }
    if (a.speedLev >= 0) {
      userStat += a.speedLev;
    }
    umd = Math.min(200, 60+20*userStat);
    return umd;
  }
  else if(moveId == 210) {
    var use_counter = 0;
    if ((b.damage[totalTurns-1] > 0) && (a.moves[totalTurns-1] == 210)) {
      use_counter =1;
      if ((b.damage[totalTurns-2] > 0) && (a.moves[totalTurns-2] == 210)) {
        use_counter =2;
        if ((b.damage[totalTurns-3] > 0) && (a.moves[totalTurns-3] == 210)) {
          use_counter =3;
        }
      }
    }
    umd = 20 * Math.pow(2,use_counter);
    return umd;
  }
  else if((moveId == 67) || (moveId == 447)) {
    var w = b.weight;
    if (w >= 200) {
      umd = 120;
      return umd;
    }
    else if(w >= 100) {
      umd = 100;
      return umd;
    }
    else if(w >= 50) {
      umd = 80;
      return umd;
    }
    else if(w >= 25) {
      umd = 60;
      return umd;
    }
    else if(w >= 10) {
      umd = 40;
      return umd;
    }
    else {
      umd = 20;
      return umd;
    }
  }
  else if(moveId == 497) {
  var use_counter = 1;
  if ((a.moves[totalTurns-1] == 497)) {
    use_counter =2;
    if (a.moves[totalTurns-2] == 497) {
      use_counter =3;
      if (a.moves[totalTurns-3] == 497) {
        use_counter =5;
        if (a.moves[totalTurns-4] == 497) {
          use_counter =5;
        
        }
      }
    }
  }
  umd = Math.min(200,40*use_counter);
  return umd;  //echoed voice
  }
  else if(moveId == 506) {
    if (b.hasStatus-5 <= 0) {
      umd = 100;
      return umd;
    }
    else {
      umd = 50;
      return umd; //hex
    }
  }
  else if((moveId == 378) && (moveId == 462)) {//ADD NUMBERS FROM HERE, INCLUSIVE
    var maxhp = sethp(b.baseHp, b.ivHp, b.evHp, b.level); //wring out, crush grip
    umd = Math.floor(120*((b.hp*4096) / (maxhp*4096)));
    return umd;  
}
  else if(moveId == 372) { 
    if(b.beforeTurnDamage[totalTurns] > 0) {
      umd = 100;
      return umd;
    }
    else {
      umd = 50;
      return umd;
    }
  }
  else if((moveId == 484) || (moveId == 535)) {
    var w = a.weight/ b.weight;
    if(w >= 5) {
      umd = 120;
      return umd;
    }
    else if((4 <= w) && (w < 5)) {
      umd = 100;
      return umd;
    }
    else if((3 <= w) && (w < 4)) {
      umd = 80;
      return umd;
    }
    else if((2 <= w) && (w < 3)) {
      umd = 60;
      return umd;
    }
    else {
      umd = 40;
      return umd;
    }
  }
  else if(moveId == 500) {
    var userStat = 0;
    if (a.attackLevel >= 0) {
      userStat += a.attLev;
    }
    if (a.defenseLevel >= 0) {
      userStat += a.defLev;
    }
    if (a.spattackLevel >= 0) {
      userStat += a.spattLev;
    }
    if (a.spdefenseLevel >= 0) {
      userStat += a.spdefLev;
    }
    if (a.speedLevel >= 0) {
      userStat += a.speedLev;
    }
    umd = ((20) + 20 * userStat); //99.99% DOESN'T INCULDE ACCURACY AND EVASION, SMOGON'S ARTICLE SAYS WRONG ABOUT IT, STILL CAN RESEARCH
    return umd;
  }
  else if(move == 512) {
    if (a.item == 0) { //0 means the user is holding nothing (or "The User is holding item no. 0 - "No Item"") (can check ref. for details)
      umd = 110;
      return umd;
    }
    else {
      umd = 55;
      return umd;
    } 
  }
  else if((move == 175) || (move == 179)) {
    var maxhp = sethp(a.baseHp, a.ivHp, a.evHp, a.level);
    var p = ((48 * a.hp)/ maxhp);
    if (p <= 1) {
      umd = 200;
     return umd;
    }
    else if((2 <= p) && (p <= 4)) {
      umd = 150;
      return umd;
    }
    else if((5 <= p) && (p <= 9)) {
      umd = 100;
      return umd;
    }
    else if((10 <= p) && (p <= 16)) {
      umd = 80;
      return umd;
    }
    else if((17 <= p) && (p <= 32)) {
      umd = 40;
      return umd;
    }
    else {
      umd = 20;
      return umd;
    }
  }
  else if(moveId == 376) {
    if((a.movepp[atIndex] >= 5) || (a.byPassive == true)) { //byPassive needs to be re-checked as it is array now
      umd = 40;
      return umd;
    }
    else if(a.movepp[atIndex] == 4) {
      umd = 50;
      return umd; 
    }
    else if(a.movepp[atIndex] == 3) {
      umd = 60;
      return umd;
    }
    else if(a.movepp[atIndex] == 2) {
      umd = 80;
      return umd; 
    }
    else if(a.movepp[atIndex] == 1) {
      umd = 200;
     return umd;
    }
  }
  else if(moveId == 496) { //BASEPOWER IS DOUBLED TO 120 IF ALLY USED MOVE IN SAME TURN (ONLY POSSIBLE IN DOUBLE OR TRIPPLE BATTLES)
    if (u_round == true) { //neeeds to be checked
     umd = 120;
     return umd;
   }
   else {
     umd = 60;
     return umd;
   }
  }
  else if(moveId == 167) {
    if (a.moves[totalTurns-1] == 167) {
      bp = 20;
      if (a.moves[totalTurns-2] == 167) {
        bp = 30;
      }
    }
    else {
      bp = 10;
    }
    return bp;  
  }
  else if(moveId == 358) {
    if (b.hasStatus == 2) {
      umd = 120;
      return umd;
    }
    else {
      umd = 60;
      return umd;
    }
  }
   else if(moveId == 265) {
     if (b.hasStatus == 1) {
       umd = 120;
       return umd;
     }
     else {
      umd = 60;
      return umd;
    } 
  }
  else if(moveId == 311) {
    if (weather != 0) { //WEATHEer != 0 means weather is not default, btw this is move "Weather Ball"
      umd = 100;
      return umd;
    }
    else {
      umd = 50;
      return umd;
    }
  }
  else if((moveId == 16) || (moveId == 239)) {
    if ((isChargingBounce == true) || (isChargingFly == true) || (isChargingSkyDrop) == true) { //add these values in array in starting
      umd = 80;
      return umd;
    }
    else {
      umd = 40;
      return umd;
    }
  }
  else if(moveId == 251) { //beat up is simliar to other multi hit attacks where hit = num of un-fainted, un-suffered(fromStatus) and un-egg pokemons
    //BEAT UP
   //stil to find method to deal with multi-hit attacks....
  }
  
  else if(moveId = 237) { 
    //HIDDEN POWER
    //This attack's power is equal to (X*40/63)+30, rounded down, where X is 0, plus 1 if half the user's HP individual value (IV) is odd, plus 2 if half its Attack IV is odd, plus 4 if half its Defense IV is odd, plus 8 if half its Speed IV is odd, plus 16 if half its Special Attack IV is odd, plus 32 if half its Special Defense IV is odd. This attack's type is equal to (X * 15 / 63), rounded down, where X is 0, plus 1 if the user's HP IV is odd, plus 2 if its Attack IV is odd, plus 4 if its Defense IV is odd, plus 8 if its Speed IV is odd, plus 16 if its Special Attack IV is odd, plus 32 if its Special Defense IV is odd, and the type is selected from this list: 0 = Fighting; 1 = Flying; 2 = Poison; 3 = Ground; 4 = Rock; 5 = Bug; 6 = Ghost; 7 = Steel; 8 = Fire; 9 = Water; 10 = Grass; 11 = Electric; 12 = Psychic; 13 = Ice; 14 = Dragon; 15 = Dark.
    var x=0;
    var tempMoveType=0;
    if((a.ivHp % 2) == 0) {
      x +=1;
    }
    if((a.ivAtt % 2) == 0) {
      x +=2;
    }
    if((a.ivDef % 2) == 0) {
      x +=4;
    }
    if((a.ivSpAtt % 2) == 0) {
      x +=8;
    }
    if((a.ivSpDef % 2) == 0) {
      x +=16;
    }
    if((a.ivSpeed % 2) == 0) {
      x +=32;
    }
    //tempMoveType = ((x*15)/63) + 1;//VERY VERY VERY IMPORTANT IMPORTANT IMPORTANT NOTE, YOU HAVE TO CALL moveType[moveId] TO SELECT TYPE BUT YOU WILL ALSO HAVE TO SAVE IT IN TEMP. VARIABLE (BEFORE RUNNING ANY BATTLE FUNCTIONS) AND THEN RE-ASSIGN THAT TEMP. VARIABLE WHILE CHANGES AND AND AND AND NOT NOT NOT NOT THE ACTUAL REF.
  }
  else if(moveId == 255) {
    //spit up
    umd = 100 * a.stockpile;
    return umd;
  }
  else if(moveId == 228) {//pursuit
    if (b.isSwitching) {
      umd = 80;
      return umd;
    }
    else {
      umd = 40;
      return umd;
    }
  }
  else if(moveId == 217) {
  var r = Math.floor((Math.random()*80)+1);
    if (r < 40) {
      umd = 40;
      return umd;
    }
    else if(r < 70) {
      umd = 80;
      return umd;
    }
    else {
      umd = 120;
      return umd;
    }
  }
  else if(moveId == 363) {
    if ((a.item > 303) && (a.item < 368)) { //user is holding a berry
       umd = berryNPPower[a.item-304];
       //HAVE TO ASSIGN TYPE, TOO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
       return umd;
    }
  }
  else if(moveId == 222) {
  var r = Math.floor((Math.random()*80)+1);
    if (r < 5) {
      f = 0;
    }
    else if((5 <= r) && (r < 16)) {
      f = 1;
    }
    else if((16 <= r) && (r < 35)) {
      f = 2;
    } 
    else if((35 <= r) && (r < 65)) {
      f = 3;
    }
    else if((65 <= r) && (r < 85)) {
      f = 4;
    }
    else if((85 <= r) && (r < 95)) {
      f = 5;
    }
    else if(r >= 95) {
      f = 6;
    }
    umd = (10 + (20 * f));
    return umd;
  }
  else if(moveId == 205) {
  var use_counter = 1;

  if ((a.moves[totalTurns-1] == 205)) {
    use_counter =2;
    if (a.moves[totalTurns-2] == 205) {
      use_counter =3;
      if (a.moves[totalTurns-3] == 205) {
        use_counter =4;
        if (a.moves[totalTurns-4] == 205) {
          use_counter =5;
        }
      }
    }
  }
    if ($.inArray(111, a.moves) != -1) {
      use_counter +=1;
    }
    umd = 30 * Math.pow(2,use_counter);
    return umd;
  }
  else if(moveId == 374) {
   //fling
  }
  else if((moveId == 518) || (moveId = 519) || (moveId = 520)) {
  //pledge
  } 
} //function basePowerException ends here

function switchPokemon(switchWith) {                                        //switching pokemon
	//this function should be only called if user is able to switch
	//Update party first
	//to update : forms, items, ability, status, moves data; note that forms be changed, items maybe used, ability can be changed thorugh worry seed and status can be changed.
    party.forms[selected] = user.form;
    party.items[selected] = user.item;
    party.abilitys[selected] = user.ability;
    party.hasStatuss[selected] = user.hasStatus;
    party.movespps[selected] = user.movespp;
    
    //show list of unfainted pokemon, yet to figure out.
}
function consumeBerry(obje) {                                              //consuming berry

    obje.item = null;
}
function chooseCommand(cmd) { //0 = move, 1 = item, 2 = switch, 3 = run
	if (cmd == 0) {
		triggerMoveSel(user);
	} else if (cmd == 1) {
		triggerItemSel();
	} else if (cmd == 2) {
		triggerSwitchSel();
	} else if (cmd == 3) {
		if (battle_type != 0) { //right now, battle type 0 defines single wild battle, since we don't have any other, this will always return true
			console.log("No escape from this type of battles!"); //CHANGE CONSOLE LOGS WITH MESSAGE ON USER'S SCREEN
		} else {
			triggerRun();
		}
	}
}
function triggerMoveSel(a) {
	console.log("Select your pokemon\'s move, enter following values for <arg> in last line's code\:");
	console.log("0 = " +moveName[a.move1]+ "PP: "+a.move1pp);
	console.log("1 = " +moveName[a.move2]+ "PP: "+a.move2pp);
	console.log("2 = " +moveName[a.move3]+ "PP: "+a.move3pp);
	console.log("3 = " +moveName[a.move4]+ "PP: "+a.move4pp);
	console.log("Send your inputs using theTurner(user, <arg>, party, foe, foeside)");
}
function foeMoveSel(b) {
	b_rand = Math.floor((Math.random()*4));
	b_moveId = 0;
	switch (b_rand) { 
		case 0:
			if (b.move1pp > 0) {
				b_moveId = b.move1;
				break;
			} else {
				b_rand = Math.floor((Math.random()*3)+1) //randomly selects 1 or 2 or 3, doesn't breaks after doing so
			}
		case 1:
			if (b.move2pp > 0) {
				b_moveId = b.move2;
				break;
			} else {
				b_rand = Math.floor ((Math.random()*3)+1) //randomy selects 1 or 2 or 3, doesn't breaks after doing so
				if ((b_rand == 1) && (b.move1pp > 0)) {  //if 1 is selected, its meaning less, so check for 0, if ppOfMove@0 is > 0, select it, else continue without breaking.
					b_moveId = b.move1;
					break;
				}
			}
		case 2:
			if (b.move3pp > 0) {
				b_moveId = b.move3;
				break;
			} else {
				b_rand = Math.floor ((Math.random()*3)+1) //randomy selects 1 or 2 or 3, doesn't breaks after doing so
				if ((b_rand == 2) && (b.move1pp > 0)) {  //if 2 is selected, its meaning less, so check for 0, if ppOfMove@0 is > 0, select it, else continue without breaking.
					b_moveId = b.move1;
					break;
				}
				if ((b_rand == 1) && (b.move2pp > 0)) {  //if 2 is selected, its meaning less, so check for 0, if ppOfMove@0 is > 0, select it, else continue without breaking.
					b_moveId = b.move2;
					break;
				}
			}
		case 3:
			if (b.move4pp > 0) {
				b_moveId = b.move4;
				break;
			} else {
				b_rand = Math.floor ((Math.random()*3)) //randomy selects 1 or 2 or 0, doesn't breaks after doing so
				if ((b_rand == 0) && (b.move1pp > 0)) {  //if 1 is selected, its meaning less, so check for 0, if ppOfMove@0 is > 0, select it, else continue without breaking.
					b_moveId = b.move1;
					break;
				}
				if ((b_rand == 1) && (b.move2pp > 0)) {  //if 1 is selected, its meaning less, so check for 0, if ppOfMove@0 is > 0, select it, else continue without breaking.
					b_moveId = b.move2;
					break;
				}
				if ((b_rand == 2) && (b.move3pp > 0)) {  //if 1 is selected, its meaning less, so check for 0, if ppOfMove@0 is > 0, select it, else continue without breaking.
					b_moveId = b.move3;
					break;
				}
			}
		}
		if (b_moveId == 0) {
			foeMoveSel(b);
		}
		var toR = new Array();
		toR[0] = b_moveId;
		toR[1] = b_rand;
		return toR;
}
function selectFirstMover(a,aside, b, bside) {
	var bmove;
	var getR = new Array();
	getR = foeMoveSel(b, bside);
	foe.moveId = getR[0];
	bmove = getR[1];
	foe.moveAt = bmove;
	var amove = a.moveAt;
	switch (amove) {
		case 0 :
			if (a.move1pp > 0) {
				user.moveId = a.move1;
				return priLevel(user, party, foe, foeside);
				break;
			} else {
				console.log("That move is out of PP");
				break;
			}
		case 1 :
			if (a.move2pp > 0) {
				user.moveId = a.move2;
				return priLevel(user, party, foe, foeside);
				break;
			} else {
				console.log("That move is out of PP");
				break;
			}
		case 2 :
			if (a.move3pp > 0) {
				user.moveId = a.move3;
				return priLevel(user, party, foe, foeside);
				break;
			} else {
				console.log("That move is out of PP");
				break;
			}
		case 3 :
			if (a.move4pp > 0) {
				user.moveId = a.move4;
				return priLevel(user, party, foe, foeside);
				break;
			} else {
				console.log("That move is out of PP");
				break;
			}
	}
}
function theTurner(a, amove, aside, b, bside) {
	totalTurns +=1; //:) Congratulations!
	console.log("Start of turn :"+totalTurns);
	console.log(a.name+"\'s hp left: "+a.hp);
	console.log(b.name+"\'s hp left: "+b.hp);
	user.moveAt = amove;
	
	var goingFirst = selectFirstMover(a, aside, b, bside); //this function also updates foe.moveAt, foe.moveId, user.moveId. User.moveAt is updated 1 line above.
	console.log ("Going first with "+goingFirst);
	if (goingFirst == "u") {
		switch (amove) {
			case 0: moveId = a.move1; a.move1pp -=1;  break;
			case 1: moveId = a.move2; a.move2pp -=1;break;
			case 2: moveId = a.move3; a.move3pp -=1;break;
			case 3: moveId = a.move4; a.move4pp -=1;break;
		}
		if (!accCheck(a, aside, b, bside, moveId)) {
			console.log(a.name+"\'s attack missed!");
		} else {
			if (!obedCheck(player, a)) {
			console.log(a.name+" rulled out your order :P!!!");
			} else {
				damage = calculateDamage(a.moveId, user.moveAt, user, party, foe, foeside);
				console.log(a.name+" used "+moveName[moveId]+"!");
				b.hp -= damage;
				console.log(b.name+" lost "+damage+" of its hp!");
				if (b.hp <= 0) {
					console.log(b.name+" fainted!");
					return;
				}
			}
		}
		var getR = new Array();
		getR = foeMoveSel(b);
		moveId = getR[0];
		foe.moveAt = getR[1];
		switch (foe.moveAt) {
			case 0: b.move1pp -= 1; break;
			case 1: b.move2pp -= 1; break;
			case 2: b.move3pp -= 1; break;
			case 3: b.move4pp -= 1; break;
		}
		if (!accCheck(b, bside, a, aside, moveId)) {
			console.log(a.name+"\'s attack missed!");
		} else {
				damage = calculateDamage(b.moveId, foe.moveAt, foe, foeside, user, party);
				console.log(b.name+" used "+moveName[moveId]+"!");
				a.hp -= damage;
				console.log(a.name+" lost "+damage+" of its hp!");
				if (a.hp <= 0) {
					console.log(a.name+" fainted!");
					return;
				}
		}
		
	}
	else if (goingFirst == "f") {
		var getR = new Array();
		getR = foeMoveSel(b);
		moveId = getR[0];
		foe.moveAt = getR[1];
		switch (foe.moveAt) {
			case 0: b.move1pp -= 1; break;
			case 1: b.move2pp -= 1; break;
			case 2: b.move3pp -= 1; break;
			case 3: b.move4pp -= 1; break;
		}
		if (!accCheck(b, bside, a, aside, moveId)) {
			console.log(a.name+"\'s attack missed!");
		} else {
				damage = calculateDamage(b.moveId, foe.moveAt, foe, foeside, user, party);
				console.log(b.name+" used "+moveName[moveId]+"!");
				a.hp -= damage;
				console.log(a.name+" lost "+damage+" of its hp!");
				if (a.hp <= 0) {
					console.log(a.name+" fainted!");
					return;
				}
		}
		switch (amove) {
			case 0: moveId = a.move1; a.move1pp -=1;  break;
			case 1: moveId = a.move2; a.move2pp -=1;break;
			case 2: moveId = a.move3; a.move3pp -=1;break;
			case 3: moveId = a.move4; a.move4pp -=1;break;
		}
		if (!accCheck(a, aside, b, bside, moveId)) {
			console.log(a.name+"\'s attack missed!");
		} else {
			if (!obedCheck(player, a)) {
			console.log(a.name+" rulled out your order :P!!!");
			} else {
				damage = calculateDamage(a.moveId, user.moveAt, user, party, foe, foeside);
				console.log(a.name+" used "+moveName[moveId]+"!");
				b.hp -= damage;
				console.log(b.name+" lost "+damage+" of its hp!");
				if (b.hp <= 0) {
					console.log(b.name+" fainted!");
					return;
				}
			}
		}
	}
	console.log(a.name+"\'s hp left: "+a.hp);
	console.log(b.name+"\'s hp left: "+b.hp);
	
	console.log("End of turn "+totalTurns); 
	chooseCommand();	
	}

function countAttack(moveId, atIndex, a, aside, b, bside) {
	var rawstate;
	var booster;
	if (moveDamageClass[moveId] == 1) {
		if (moveId == 492) {
		rawstate = b.att;
		} else {
		rawstate = a.att;
		}
		booster = a.attLev;
	} else {
		if (moveId == 492) {
		rawstate = b.att;
		} else {
		rawstate = a.att;
		}
		booster = a.spattLev;
	}
	if (!a.ability == 109) {
		switch (booster) {
			case -6: if (!a.criticalHit) { rawstate *= (2/8); } else {rawstate = rawstate; } break;
			case -5: if (!a.criticalHit) { rawstate *= (2/7); } else {rawstate = rawstate; } break;
			case -4: if (!a.criticalHit) { rawstate *= (2/6); } else {rawstate = rawstate; } break;
			case -3: if (!a.criticalHit) { rawstate *= (2/5); } else {rawstate = rawstate; } break;
			case -2: if (!a.criticalHit) { rawstate *= (2/4); } else {rawstate = rawstate; } break;
			case -1: if (!a.criticalHit) { rawstate *= (2/3); } else {rawstate = rawstate; } break;
			case 0: rawstate *= (2/2); break;
			case 1: rawstate *= (3/2); break;
			case 2: rawstate *= (4/2); break;
			case 3: rawstate *= (5/2); break;
			case 4: rawstate *= (6/2); break;
			case 5: rawstate *= (7/2); break;
			case 6: rawstate *= (8/2); break;
		}
	}
	rs = rawstate//for easy typing
	if ((b.ability == 47) && ((moveType[moveId] == 14) || (moveType[moveId] == 9))) {
		rs = applyMod(rs, 0x800);
	}
	if ((a.ability == 67) && (a.hp <= (sethp(a.basehp, a.ivHp, a.evHp, a.level)/3)) && (moveType[moveId]==10)) {
		rs = applyMod(rs, 0x1800);
	}
	if ((a.ability == 62) && ((a.hasStatus > 0) && (a.hasStatus <6 )) && (moveDamageClass[moveId]==1)) {
		rs = applyMod(rs, 0x1800);
	}
	if ((a.ability == 68) && (a.hp <= (sethp(a.basehp, a.ivHp, a.evHp, a.level)/3)) && (moveType[moveId] == 6)) {
		rs = applyMod(rs, 0x1800);
	}
	if ((a.ability == 65) && (a.hp <= (sethp(a.basehp, a.ivHp, a.evHp, a.level)/3)) && (moveType[moveId] == 11)) {
		rs = applyMod(rs, 0x1800);
	}
	if (((a.ability == 57) || (a.ability == 58)) && ((b.ability == 57) || (b.ability == 58)) && (moveDamageClass[moveId] == 2)) {
		rs = applyMod(rs, 0x1800);
	}
	if ((a.ability == 66) && (a.hp <= (sethp(a.basehp, a.ivHp, a.evHp, a.level)/3)) && (moveType[moveId] == 9)) {
		rs = applyMod(rs, 0x1800);
	}
	if ((a.ability == 129) && (a.hp <= (sethp(a.basehp, a.ivHp, a.evHp, a.level)/2))) {
		rs = applyMod(rs, 0x800);
	}
	if (((a.ability == 74) || (a.ability == 37)) && (moveDamageClass[moveId]==1)) {
		rs = applyMod(rs, 0x2000);
	}
	if ((a.ability == 94) && (weather == 1) && (moveDamageClass[moveId] == 2)) {
		rs = applyMod(rs, 0x1800);
	}
	if ((a.ability == 18) && (a.flashfire) && (moveType[moveId]==9)) {
		rs = applyMod(rs, 0x1800);
	}
	/*slow start...yet to figure out
	if ((a.ability == 112) && () && (moveDamageClass[moveId]==1)) {
		rs = applyMod(rs, 0x800);
	}*/
	
	//ALLIES NOT YET SUPPORTED, trigger of Cherrim left
	if (((a.nid == 104)||(a.nid == 105)) && (a.item == 200) && (moveDamageClass[moveId] == 1)) {
		rs = applyMod(rs, 0x2000);
	}
	if ((a.nid == 366) && (a.item == 60) && (moveDamageClass[moveId] == 2)) {
		rs = applyMod(rs, 0x2000);
	}
	if ((a.nid == 25) && (a.item == 92)) {
		rs = applyMod(rs, 0x2000);
	}
	if (((a.nid == 380)||(a.nid == 381)) && (a.item == 131) && (moveDamageClass[moveId] == 2)) {
		rs = applyMod(rs, 0x1800);
	}
	if ((a.item == 4) && (moveDamageClass[moveId] == 1)) {
		rs = applyMod(rs, 0x1800);
	}
	if ((a.item == 6) && (moveDamageClass[moveId] == 2)) {
		rs = applyMod(rs, 0x1800);
	}
	return rs;
	
}
function countDefense(moveId, atIndex, a, aside, b, bside) {
	var rawstate;
	var booster;
	if (moveDamageClass[moveId] == 1) {
		rawstate = b.def;
		booster = b.defLev;
	} else {
		rawstate = b.spdef;
		booster = b.spdefLev;
	}
	if (!b.ability == 109) {
		switch (booster) {
			case 6: if (!a.criticalHit) { rawstate *= (8/2); } else {rawstate = rawstate; } break;
			case 5: if (!a.criticalHit) { rawstate *= (7/2); } else {rawstate = rawstate; } break;
			case 4: if (!a.criticalHit) { rawstate *= (6/2); } else {rawstate = rawstate; } break;
			case 3: if (!a.criticalHit) { rawstate *= (5/2); } else {rawstate = rawstate; } break;
			case 2: if (!a.criticalHit) { rawstate *= (4/2); } else {rawstate = rawstate; } break;
			case 1: if (!a.criticalHit) { rawstate *= (3/2); } else {rawstate = rawstate; } break;
			case 0: rawstate *= (2/2); break;
			case -1: rawstate *= (2/3); break;
			case -2: rawstate *= (2/4); break;
			case -3: rawstate *= (2/5); break;
			case -4: rawstate *= (2/6); break;
			case -5: rawstate *= (2/7); break;
			case -6: rawstate *= (2/8); break;
		}
	}
	rs = rawstate; //as above, for easy writing
	if (((pokeTypeO[a.nid] == 5) || (pokeTypeT[a.nid] == 5)) && (weather == 3) && (moveDamageClass[moveId] == 2)) {
		rs = applyMod(rs, 0x1800);
	}
	if ((b.ability == 63) && ((b.hasStatus > 0) && (b.hasStatus <6 )) && (moveDamageClass[moveId]==1)) {
		rs = applyMod(rs, 0x1800);
	}
	/*ALLIES NOT YET SUPPORTED, cherim thing left.*/
	if ((b.nid == 366) && (b.item == 60) && (moveDamageClass[moveId] == 2)) {
		rs = applyMod(rs, 0x1800);
	}
	if ((b.nid = 192) && (b.transformed == false) && (b.item == 18 ) && (moveDamageClass[moveId]==1)) {
		rs = applyMod(rs, 0x2000);
    }
	//FULLY EVOLVED THING, YET TO FIGURE OUT, Eviolite
	if (((b.nid == 380)||(b.nid == 381)) && (b.item == 131) && (moveDamageClass[moveId] == 2)) {
		rs = applyMod(rs, 0x1800);
	}
	return rs;
}
function calculateDamage(moveId, atIndex, a, aside, b, bside) {
	var l = a.level;
	var bp = countBasePower(moveId, atIndex, a, aside, b, bside);
	var a = countAttack(moveId, atIndex, a, aside, b, bside);
	var d = countDefense(moveId, atIndex, a, aside, b, bside);
	var bd = ((((((2*l)/5)+2)*bp*a)/d)/50)+2;
	bd = (bd * (100 - (Math.random()*15)))/100;
	if (criHit(a, aside, b, bside, moveId)) {
		bd *= 2;
	}
	if ((moveType[moveId] == pokeTypeO[a.nid]) || (moveType[moveId] == pokeTypeT[a.nid])) {
		if (a.ability == 91) {
			bd = applyMod(bd, 0x1800);
		}else {
			bd = applyMod(bd, 0x2000);
		}
	}
	bd = typeEffectiveness(bd, moveId, atIndex, a, aside, b, bside);
	if ((a.hasStatus == 4)&&( moveDamageClass[moveId] == 1)) {
		bd /= 2;
	}
	bd = finalModifier(bd, moveId, atIndex, a, aside, b, bside);
	if (bd <= 1) {
		bd = 1;
	}
	console.log(Math.round(bd));
	return Math.round(bd);
}
function typeEffectiveness(bd, moveId, atIndex, a, aside, b, bside) {
	//http://www.smogon.com/bw/articles/bw_complete_damage_formula#type-eff
	//This function is incomplete, check above guide. Sorry :'(
	//Simply returns bd;
	return bd;
}

function finalModifier(bd, moveId, atIndex, a, aside, b, bside) {
	//http://www.smogon.com/bw/articles/bw_complete_damage_formula#final
	//This function is incomplete, check above guide. Sorry :'(
	//Simply returns bd;
	return bd;
}

