# Mario JS

Un petit jeu de plateforme inspiré de Super Mario, en HTML, CSS et jQuery.

## Jouer

Ouvrez `index.html` dans un navigateur, ou servez le dossier avec n'importe quel serveur web local (XAMPP, `python -m http.server`, etc.).

## Commandes

| Touche | Action |
| --- | --- |
| ← / → | Se déplacer (maintenir pour avancer) |
| ↑ | Sauter |
| Espace | Sauter en diagonale dans la direction du regard |

## Règles

- **Cases en l'air** : sautez dessous pour les casser d'un coup de tête. Chaque case rapporte 100 points.
- **Goomba** : retombez-lui sur la tête pour l'écraser (100 points). S'il vous touche autrement, c'est le **GAME OVER**.
- **Château** : entrez par la porte pour terminer le niveau.
- Le score s'affiche en haut à droite. Les boutons **Restart** et **Rejouer** relancent la partie.

## Réglages

Les constantes en haut de `js/script_ancien.js` permettent d'ajuster le jeu :

| Constante | Rôle |
| --- | --- |
| `VITESSE` | Vitesse de Mario (px/s) |
| `VITESSE_GOOMBA` | Vitesse du goomba (px/s) |
| `DUREE_APPUI_MIN` | Durée de déplacement garantie pour un appui bref (ms) |
| `DISTANCE_CHATEAU` | Distance entre la porte du château et le bord droit du décor (px) |
| `POINTS_CASE`, `POINTS_GOOMBA` | Points rapportés |

## Structure

```
index.html            page du jeu
css/styles.css        mise en page, animations, écrans de fin
js/script_ancien.js   logique du jeu (boucle, sauts, collisions, score)
js/jquery.js          jQuery
img/                  sprites et décor
sons/                 effets sonores
```

## Versions

- `v1.0` : première version du jeu, avant la refonte.
