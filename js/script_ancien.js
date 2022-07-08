//////////////////////////////////////////////// POSITION /////////////////////////////////////
var position = function(){    
    var mario = $('#mario img');
    var cube =  $('#cube');
    var marioPosition = mario.offset();
    var cubePosition  = cube.offset();
    if (marioPosition.top < cubePosition.top) {
            console.log('ho');
        if(marioPosition.left > 255 && marioPosition < 305){
            $("#cube").toggle("explode");
            console.log('yeah');
        }    
    };
};
 //////////////////////////////////////////////// DROITE /////////////////////////////////////
var droite = function(){
    $("#mario img").attr('src','img/mario.gif');
    $("#mario img").animate({left:"+=25px"});
    $("#mario img").removeClass("marioinverse");
    setTimeout(function() {
        $("#mario img").attr('src','img/marios.png');
    }, 500);
};        

 //////////////////////////////////////////////// GAUCHE /////////////////////////////////////
 var gauche = function(){
    $("#mario img").attr('src','img/mario.gif');
    $("#mario img").animate({left:"-=25px"});
    $("#mario img").addClass("marioinverse");
    setTimeout(function() {
        $("#mario img").attr('src','img/marios.png');
    }, 500);
 };
         

 //////////////////////////////////////////////// HAUT /////////////////////////////////////
 var haut = function(){
    $("#mario img").attr('src','img/mario_jump.png');
    $("#mario img").animate({bottom:"+=96px"});
    $("#mario img").delay(100);
    $("#mario img").animate({bottom:"33px"});
    setTimeout(function() {
        $("#mario img").attr('src','img/marios.png');
    }, 500);
 };

 var sautDiagonal = function(){
    $("#mario img").attr('src','img/mario_jump.png');
    if ( $('.marioinverse').hasClass('marioinverse') ) {
        $("#mario img").animate({left: '-=50', bottom: '+=102'}, 500); // saut en haut à gauche
        $("#mario img").animate({left: '-=50', bottom: '-=102'}, 500);
    }else{
        $("#mario img").animate({left: '+=50', bottom: '+=102'}, 500); // saut en haut à gauche
        $("#mario img").animate({left: '+=50', bottom: '-=102'}, 500);
    }
    $("#mario img").delay(100);
    $("#mario img").animate({bottom:"33px"});

    setTimeout(function() {
        $("#mario img").attr('src','img/marios.png');
    }, 500);
 };

 //////////////////////////////////////////////// GOOMBA /////////////////////////////////////

var goomba = function(){
    $("#goomba img").animate({left:"120px"},3000);
    $("#goomba img").delay(200);
    $("#goomba img").animate({left:"-120px"},3000);
    goomba();
};

 //////////////////////////////////////////////// SON /////////////////////////////////////

var jump_sound = new Audio('sons/saut.wav');


 //////////////////////////////////////////////// CONTROLLER /////////////////////////////////////
window.onload=function(){goomba()};

$(document).keydown(function(event){ 
    position(); // fonction brise brique
    switch(event.which){
        case 37:   
            gauche();
            event.stopPropagation();
        break;

        case 38:
            haut();
            jump_sound.play();
        break;

        case 39:
            droite();
        break;

        case 32:
            sautDiagonal();
            jump_sound.play();
        break;
    }

});