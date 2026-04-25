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

        // Chargement des images
        this.images = {
            bg: new Image(),
            stars: new Image(),
            planets: new Image(),
            meteors: new Image()
        };

        this.images.bg.src = 'img/Space_BG_01/BG.png';
        this.images.stars.src = 'img/Space_BG_01/Stars.png';
        this.images.planets.src = 'img/Space_BG_01/Planets.png';
        this.images.meteors.src = 'img/Space_BG_01/Meteors.png';
    }

    update() {
        // Incrémente les positions Y
        this.yStars += this.config.speedStars;
        this.yPlanets += this.config.speedPlanets;
        this.yMeteors += this.config.speedMeteors;
    }

    drawLayer(ctx, image, yOffset, scaleMult, alpha) {
        if (!image.complete || image.naturalWidth === 0) return;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Calcul de l'échelle : l'image s'adapte à la largeur du jeu * le scale personnalisé
        const scale = (this.game.width / image.naturalWidth) * scaleMult;
        const scaledWidth = image.naturalWidth * scale;
        const scaledHeight = image.naturalHeight * scale;

        // On fait boucler l'offset Y modulo la hauteur de l'image
        const currentY = yOffset % scaledHeight;

        // Dessin de l'image principale
        ctx.drawImage(image, 0, currentY, scaledWidth, scaledHeight);

        // Dessin de la "copie" juste au-dessus pour que la transition soit invisible
        ctx.drawImage(image, 0, currentY - scaledHeight, scaledWidth, scaledHeight);

        // Si jamais l'image n'est pas assez haute pour couvrir l'écran après scaling,
        // on ajoute une 3e copie en haut (cas rare, mais sécuritaire)
        if (currentY - scaledHeight + scaledHeight < this.game.height) {
            ctx.drawImage(image, 0, currentY - (scaledHeight * 2), scaledWidth, scaledHeight);
        }

        ctx.restore();
    }

    draw(ctx) {
        // 1. Fond statique (BG)
        if (this.images.bg.complete && this.images.bg.naturalWidth > 0) {
            // On l'étire pour remplir tout le canvas
            ctx.drawImage(this.images.bg, 0, 0, this.game.width, this.game.height);
        } else {
            // Fallback
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, this.game.width, this.game.height);
        }

        // 2. Étoiles (arrière-plan, le plus lent)
        this.drawLayer(ctx, this.images.stars, this.yStars, this.config.scaleStars, this.config.alphaStars);

        // 3. Planètes (plan intermédiaire)
        this.drawLayer(ctx, this.images.planets, this.yPlanets, this.config.scalePlanets, this.config.alphaPlanets);

        // 4. Météores (premier plan, le plus rapide)
        this.drawLayer(ctx, this.images.meteors, this.yMeteors, this.config.scaleMeteors, this.config.alphaMeteors);
    }
}
