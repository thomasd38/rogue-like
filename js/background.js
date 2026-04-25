class Background {
    constructor(game) {
        this.game = game;

        // Configuration modifiable du Background
        this.config = {
            // Vitesses de défilement (pixels par frame)
            speedStars: 0.5,
            speedPlanets: 1.2,
            speedMeteors: 1.5,

            // Échelle des images (1.0 = prend toute la largeur de l'écran)
            scaleStars: 1.0,
            scalePlanets: 1.0,
            scaleMeteors: 1.0,

            // Si besoin d'ajuster l'opacité (0.0 à 1.0)
            alphaStars: 1.0,
            alphaPlanets: 1.0,
            alphaMeteors: 1.0
        };

        // Positions Y actuelles
        this.yStars = 0;
        this.yPlanets = 0;
        this.yMeteors = 0;

        // Cache des propriétés aléatoires pour chaque "tuile" de fond
        this.tileProps = {
            stars: new Map(),
            planets: new Map(),
            meteors: new Map()
        };

        // Le fond statique (nébuleuse) reste fixe (index 0 = Space_BG_01) pour l'instant
        // Il sera changé plus tard pour faire des transitions de niveaux
        this.bgIndex = 0;

        // Chargement des images
        this.images = {
            bg: [],
            stars: [],
            planets: [],
            meteors: []
        };

        for (let i = 1; i <= 4; i++) {
            const folder = `img/Space_BG_0${i}`;
            
            const bgImg = new Image(); bgImg.src = `${folder}/BG.png`;
            this.images.bg.push(bgImg);
            
            const starsImg = new Image(); starsImg.src = `${folder}/Stars.png`;
            this.images.stars.push(starsImg);
            
            const planetsImg = new Image(); planetsImg.src = `${folder}/Planets.png`;
            this.images.planets.push(planetsImg);
            
            const meteorsImg = new Image(); meteorsImg.src = `${folder}/Meteors.png`;
            this.images.meteors.push(meteorsImg);
        }
    }

    update() {
        // Incrémente les positions Y
        this.yStars += this.config.speedStars;
        this.yPlanets += this.config.speedPlanets;
        this.yMeteors += this.config.speedMeteors;
    }

    getTileProps(layer, index) {
        if (!this.tileProps[layer].has(index)) {
            this.tileProps[layer].set(index, {
                // Pile ou face pour flipper horizontalement
                flipX: Math.random() > 0.5 ? -1 : 1,
                // Variation d'opacité entre 70% et 100%
                alphaMult: 0.7 + Math.random() * 0.3,
                // Choix aléatoire de l'image (0 à 3)
                imgIndex: Math.floor(Math.random() * 4)
            });
            // Nettoyage de la mémoire pour les vieilles tuiles
            if (this.tileProps[layer].size > 10) {
                this.tileProps[layer].delete(index - 10);
            }
        }
        return this.tileProps[layer].get(index);
    }

    drawLayer(ctx, imageArray, yOffset, scaleMult, baseAlpha, layerName) {
        // On se base sur la première image pour calculer les dimensions globales
        const baseImage = imageArray[0];
        if (!baseImage.complete || baseImage.naturalWidth === 0) return;

        ctx.save();

        // Calcul de l'échelle : l'image s'adapte à la largeur du jeu * le scale personnalisé
        const scale = (this.game.width / baseImage.naturalWidth) * scaleMult;
        const scaledWidth = baseImage.naturalWidth * scale;
        const scaledHeight = baseImage.naturalHeight * scale;

        const currentY = yOffset % scaledHeight;
        const loopIndex = Math.floor(yOffset / scaledHeight);

        // Helper pour dessiner une tuile avec ses propriétés aléatoires
        const drawTile = (yPos, indexOffset) => {
            const props = this.getTileProps(layerName, loopIndex + indexOffset);
            const tileImage = imageArray[props.imgIndex];
            
            if (!tileImage || !tileImage.complete || tileImage.naturalWidth === 0) return;

            ctx.save();
            ctx.globalAlpha = baseAlpha * props.alphaMult;
            
            if (props.flipX === -1) {
                // On translate à droite puis on scale à -1 pour flipper
                ctx.translate(this.game.width, 0);
                ctx.scale(-1, 1);
            }
            
            ctx.drawImage(tileImage, 0, yPos, scaledWidth, scaledHeight);
            ctx.restore();
        };

        // Dessin de l'image principale (tuile courante)
        drawTile(currentY, 0);

        // Dessin de la "copie" juste au-dessus (tuile suivante)
        drawTile(currentY - scaledHeight, 1);

        // Si jamais l'image n'est pas assez haute pour couvrir l'écran
        if (currentY - scaledHeight + scaledHeight < this.game.height) {
            drawTile(currentY - (scaledHeight * 2), 2);
        }

        ctx.restore();
    }

    draw(ctx) {
        // 1. Fond statique (BG)
        const currentBg = this.images.bg[this.bgIndex];
        if (currentBg && currentBg.complete && currentBg.naturalWidth > 0) {
            // On l'étire pour remplir tout le canvas
            ctx.drawImage(currentBg, 0, 0, this.game.width, this.game.height);
        } else {
            // Fallback
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
        }

        // 2. Étoiles (arrière-plan, le plus lent)
        this.drawLayer(ctx, this.images.stars, this.yStars, this.config.scaleStars, this.config.alphaStars, 'stars');

        // 3. Planètes (plan intermédiaire)
        this.drawLayer(ctx, this.images.planets, this.yPlanets, this.config.scalePlanets, this.config.alphaPlanets, 'planets');

        // 4. Météores (premier plan, le plus rapide)
        this.drawLayer(ctx, this.images.meteors, this.yMeteors, this.config.scaleMeteors, this.config.alphaMeteors, 'meteors');
    }
}
