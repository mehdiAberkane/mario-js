//////////////////////////////////////////////// ETAT /////////////////////////////////////
var VITESSE = 180;       // px par seconde quand une flèche est maintenue
var ELAN_SAUT = 100;     // px par seconde pendant un saut diagonal sans flèche
var DUREE_APPUI_MIN = 150; // ms de déplacement garanties pour un appui bref
var touches = {};        // touches actuellement enfoncées
var appuiJusqua = {};    // instant jusqu'auquel un appui bref compte encore
var x = 0;               // position horizontale de mario
var sens = 1;            // 1 = droite, -1 = gauche
var saut = false;
var cogne = false;       // mario a déjà cassé une case pendant ce saut
var elan = 0;
var POINTS_CASE = 100;
var score = 0;

//////////////////////////////////////////////// SCORE /////////////////////////////////////
var ajouterScore = function(points){
    score += points;
    $("#score").text("SCORE " + ("000000" + score).slice(-6));
};

//////////////////////////////////////////////// CASES /////////////////////////////////////
// renvoie la case que la tête de mario touche (la plus proche de son centre)
var caseTouchee = function(){
    var mario = $("#mario img")[0].getBoundingClientRect();
    var centre = mario.left + mario.width / 2;
    var touchee = null;
    var distance = Infinity;
    $(".carre:not(.cassee)").each(function(){
        var c = this.getBoundingClientRect();
        var chevauche = mario.left < c.right && mario.right > c.left
                     && mario.top < c.bottom && mario.bottom > c.top;
        var d = Math.abs(centre - (c.left + c.width / 2));
        if (chevauche && d < distance) {
            touchee = this;
            distance = d;
        }
    });
    return touchee;
};

var exploser = function(bloc){
    var conteneur = $("#conteneur");
    var pos = $(bloc).addClass("cassee").position();
    var morceaux = [
        {x: 0,  y: 0,  dx: -40, r: -360},
        {x: 15, y: 0,  dx: 40,  r: 360},
        {x: 0,  y: 15, dx: -25, r: -270},
        {x: 15, y: 15, dx: 25,  r: 270}
    ];
    $.each(morceaux, function(i, m){
        var debris = $('<div class="debris"></div>').css({
            left: pos.left + m.x,
            top: pos.top + m.y,
            backgroundPosition: (-m.x) + 'px ' + (-m.y) + 'px'
        });
        debris[0].style.setProperty('--dx', m.dx + 'px');
        debris[0].style.setProperty('--r', m.r + 'deg');
        conteneur.append(debris);
        setTimeout(function(){ debris.remove(); }, 800);
    });

    var points = $('<div class="points">+' + POINTS_CASE + '</div>')
        .css({left: pos.left - 5, top: pos.top - 25});
    conteneur.append(points);
    setTimeout(function(){ points.remove(); }, 900);

    ajouterScore(POINTS_CASE);
};

//////////////////////////////////////////////// SPRITE /////////////////////////////////////
var sprite = function(src){
    var img = $("#mario img");
    if (img.attr('src') !== src) {
        img.attr('src', src);
    }
};

//////////////////////////////////////////////// SAUT /////////////////////////////////////
var finSaut = function(){
    saut = false;
    elan = 0;
};

var sauter = function(hauteur, duree, elanSaut){
    if (saut) return;
    saut = true;
    cogne = false;
    elan = elanSaut;
    jump_sound.currentTime = 0;
    jump_sound.play();
    $("#mario img")
        .animate({bottom:"+=" + hauteur + "px"}, duree)
        .delay(100)
        .animate({bottom:"33px"}, duree, finSaut);
};

// la tête de mario cogne une case : elle explose et il retombe aussitôt
var cognerCase = function(){
    var bloc = caseTouchee();
    if (!bloc) return;
    cogne = true;
    exploser(bloc);
    $("#mario img").stop(true).animate({bottom:"33px"}, 300, finSaut);
};

var haut = function(){
    sauter(96, 400, 0);
};

var sautDiagonal = function(){
    sauter(102, 500, sens * ELAN_SAUT);
};

//////////////////////////////////////////////// BOUCLE /////////////////////////////////////
var dernierTemps = null;

var boucle = function(temps){
    var dt = dernierTemps === null ? 0 : Math.min((temps - dernierTemps) / 1000, 0.05);
    dernierTemps = temps;

    var img = $("#mario img");
    var enfoncee = function(code){
        return touches[code] || temps < (appuiJusqua[code] || 0);
    };
    var direction = (enfoncee(39) ? 1 : 0) - (enfoncee(37) ? 1 : 0);

    if (direction !== 0) {
        sens = direction;
        img.toggleClass("marioinverse", sens < 0);
    }

    var vitesse = direction !== 0 ? direction * VITESSE : elan;
    var max = $("#conteneur").width() - img.width();
    x = Math.max(0, Math.min(max, x + vitesse * dt));
    img.css('left', x + 'px');

    if (saut) {
        sprite('img/mario_jump.png');
        if (!cogne) cognerCase();
    } else if (direction !== 0) {
        sprite('img/mario.gif');
    } else {
        sprite('img/marios.png');
    }

    requestAnimationFrame(boucle);
};

//////////////////////////////////////////////// GOOMBA /////////////////////////////////////

var goomba = function(){
    $("#goomba img").animate({left:"120px"},3000)
        .delay(200)
        .animate({left:"-120px"},3000, goomba);
};

//////////////////////////////////////////////// SON /////////////////////////////////////

var jump_sound = new Audio('sons/saut.wav');


//////////////////////////////////////////////// CONTROLLER /////////////////////////////////////
window.onload=function(){
    goomba();
    requestAnimationFrame(boucle);
};

$(document).keydown(function(event){
    switch(event.which){
        case 37:
        case 39:
            if (!touches[event.which]) {
                appuiJusqua[event.which] = performance.now() + DUREE_APPUI_MIN;
            }
            touches[event.which] = true;
            event.preventDefault();
        break;

        case 38:
            haut();
            event.preventDefault();
        break;

        case 32:
            sautDiagonal();
            event.preventDefault();
        break;
    }
});

$(document).keyup(function(event){
    touches[event.which] = false;
});

$(window).blur(function(){
    touches = {};
});
