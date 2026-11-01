//////////////////////////////////////////////// ETAT /////////////////////////////////////
var VITESSE = 180;       // px par seconde quand une flèche est maintenue
var ELAN_SAUT = 100;     // px par seconde pendant un saut diagonal sans flèche
var DUREE_APPUI_MIN = 150; // ms de déplacement garanties pour un appui bref
var VITESSE_GOOMBA = 40; // px par seconde
var touches = {};        // touches actuellement enfoncées
var appuiJusqua = {};    // instant jusqu'auquel un appui bref compte encore
var x = 0;               // position horizontale de mario
var sens = 1;            // 1 = droite, -1 = gauche
var saut = false;
var cogne = false;       // mario a déjà cassé une case pendant ce saut
var elan = 0;
var mort = false;
var basPrecedent = null; // bas de mario à l'image précédente, pour savoir s'il retombe
var goombaX = 0;
var goombaSens = 1;
var goombaMort = false;
var POINTS_CASE = 100;
var POINTS_GOOMBA = 100;
var score = 0;

//////////////////////////////////////////////// SCORE /////////////////////////////////////
var ajouterScore = function(points){
    score += points;
    $("#score").text("SCORE " + ("000000" + score).slice(-6));
};

// ajoute les points et affiche "+points" qui s'envole à cet endroit du conteneur
var gagner = function(points, left, top){
    var texte = $('<div class="points">+' + points + '</div>').css({left: left, top: top});
    $("#conteneur").append(texte);
    setTimeout(function(){ texte.remove(); }, 900);
    ajouterScore(points);
};

//////////////////////////////////////////////// COLLISIONS /////////////////////////////////////
// rectangle d'un élément, rétréci sur les côtés pour ignorer les bords transparents
var boite = function(element, marge){
    var r = element.getBoundingClientRect();
    return {left: r.left + marge, right: r.right - marge, top: r.top, bottom: r.bottom};
};

var chevauche = function(a, b){
    return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
};

//////////////////////////////////////////////// CASES /////////////////////////////////////
// renvoie la case que la tête de mario touche (la plus proche de son centre)
var caseTouchee = function(){
    var mario = boite($("#mario img")[0], 0);
    var centre = (mario.left + mario.right) / 2;
    var touchee = null;
    var distance = Infinity;
    $(".carre:not(.cassee)").each(function(){
        var c = boite(this, 0);
        var d = Math.abs(centre - (c.left + c.right) / 2);
        if (chevauche(mario, c) && d < distance) {
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

    gagner(POINTS_CASE, pos.left - 5, pos.top - 25);
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

//////////////////////////////////////////////// GOOMBA /////////////////////////////////////
// le goomba fait des allers-retours entre -120px et 120px
var deplacerGoomba = function(dt){
    if (goombaMort) return;
    goombaX += goombaSens * VITESSE_GOOMBA * dt;
    if (goombaX > 120)  { goombaX = 120;  goombaSens = -1; }
    if (goombaX < -120) { goombaX = -120; goombaSens = 1; }
    $("#goomba img").css('left', goombaX + 'px');
};

// mario lui retombe sur la tête : il est écrasé, disparaît, et mario rebondit
var ecraserGoomba = function(){
    var goomba = $("#goomba img");
    var conteneur = $("#conteneur").offset();
    var pos = goomba.offset();
    goombaMort = true;
    goomba.addClass("ecrase");
    setTimeout(function(){ goomba.hide(); }, 400);
    gagner(POINTS_GOOMBA, pos.left - conteneur.left, pos.top - conteneur.top - 25);

    $("#mario img").stop(true)
        .animate({bottom:"+=40px"}, 200)
        .animate({bottom:"33px"}, 300, finSaut);
};

// renvoie true si le contact avec le goomba a tué mario
var contactGoomba = function(){
    var mario = boite($("#mario img")[0], 8);
    var bas = basPrecedent === null ? mario.bottom : basPrecedent;
    basPrecedent = mario.bottom;
    if (goombaMort) return false;

    var goomba = boite($("#goomba img")[0], 4);
    if (!chevauche(mario, goomba)) return false;

    var retombe = saut && mario.bottom > bas;
    var piedsAuDessus = bas <= goomba.top + 10;
    if (retombe && piedsAuDessus) {
        ecraserGoomba();
        return false;
    }
    mourir();
    return true;
};

//////////////////////////////////////////////// GAME OVER /////////////////////////////////////
var mourir = function(){
    mort = true;
    touches = {};
    sprite('img/mario_jump.png');
    $("#mario img").stop(true)
        .animate({bottom:"+=70px"}, 300)
        .animate({bottom:"-80px"}, 700, function(){
            $("#game-over").addClass("visible");
            $("#restart").focus();
        });
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

    deplacerGoomba(dt);

    if (saut) {
        sprite('img/mario_jump.png');
        if (!cogne) cognerCase();
    } else if (direction !== 0) {
        sprite('img/mario.gif');
    } else {
        sprite('img/marios.png');
    }

    // la partie s'arrête : on ne relance plus la boucle
    if (contactGoomba()) return;

    requestAnimationFrame(boucle);
};

//////////////////////////////////////////////// SON /////////////////////////////////////

var jump_sound = new Audio('sons/saut.wav');


//////////////////////////////////////////////// CONTROLLER /////////////////////////////////////
window.onload=function(){
    requestAnimationFrame(boucle);
};

$(document).keydown(function(event){
    if (mort) return;
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

$(document).on('click', '#restart', function(){
    location.reload();
});
