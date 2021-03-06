"use strict";
var Level1 = function(game) {};

Level1.prototype = {
    cutscene: false,
    tween: null,

    preload: function() {
        // define real worlds bounds
        this.game.rwidth = this.game.width * 2;
        this.game.rheight = this.game.height * 2;
    },

    create: function() {
        //  This will run in Canvas mode, so let's gain a little speed and display
        this.game.renderer.clearBeforeRender = false;
        this.game.renderer.roundPixels = true;

        //  We need arcade physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE);

         // background stars
        this.game.world.setBounds(0, 0, this.game.rwidth, this.game.rheight);
        this.game.add.tileSprite(0, 0, this.game.rwidth, this.game.rheight, 'starfield');

        // black hole
        this.blackhole = this.game.add.sprite(2500, this.game.width - 100, 'blackhole');
        this.blackhole.alpha = 0.1;
        this.game.physics.enable(this.blackhole, Phaser.Physics.ARCADE);
        this.blackhole.body.setSize(50, 50, 100, 100);
        this.blackhole.body.collideWorldBounds = true;
        this.blackhole.body.immovable = true;

        // meteors
        var nbMeteors = 40;
        var meteorsSprite = ['meteorBig1', 'meteorBig2', 'meteorMed1', 'meteorMed2', 'meteorTiny1', 'meteorTiny2'];
        for (var i = 0; i < nbMeteors; i++) {
            var randomLogicalX = this.game.rnd.integerInRange(0, this.game.rwidth);
            var randomLogicalY = this.game.rnd.integerInRange(0, this.game.rheight);
            var randomMeteorSprite = meteorsSprite[this.game.rnd.integerInRange(0, meteorsSprite.length)];
            var tempMeteor = this.game.add.sprite(randomLogicalX, randomLogicalY, randomMeteorSprite);
            tempMeteor.rotation = this.game.rnd.integerInRange(0, 360);
        }

        // ship
        this.ship = this.game.add.sprite(this.game.width / 2, this.game.height / 2, 'ship');
        this.ship.animations.add('accelerate', [1, 2, 3, 4]);
        this.ship.animations.add('stop', [0]);
        this.ship.anchor.set(0.5);
        this.ship.scale.setTo(1.2, 1.2);
        this.game.physics.enable(this.ship, Phaser.Physics.ARCADE);
        // inertie (plus x est élevé moins l'inertie est forte)
        this.ship.body.drag.set(300);
        // définir la vitesse maximale du vaisseau
        this.ship.body.maxVelocity.set(400);
        this.ship.body.collideWorldBounds = true;

        // camera
        this.game.camera.follow(this.ship);

        // Game input
        this.cursors = this.game.input.keyboard.createCursorKeys();

        this.text = this.game.add.text(10, 0, "Find the way out from space! LVL1", {
            font: "35px Arial",
            fill: "#BDBDBD",
            align: "center"
        });

        // ajouter un indice qui sera afficher au bout de 30 secondes de jeu
        this.game.time.events.add(Phaser.Timer.SECOND * 30, this.addClue, this);

        this.text.fixedToCamera = true;
    },

    addClue: function() {
        // afficher l'aide "trouver le trou noir" !
        this.text.setText("Find the blackhole!");

        // rendre plus visible le trou noir
        this.blackhole.alpha = 0.2;
    },

    update: function() {
        // check collision between the ship and the black hole
        this.game.physics.arcade.collide(this.ship, this.blackhole, this.collisionHandler, null, this);

        if (!this.cutscene) {

            // input to move the ship
            if (this.cursors.up.isDown) {
                this.game.physics.arcade.accelerationFromRotation(this.ship.rotation, 200, this.ship.body.acceleration);
                this.ship.animations.play('accelerate', 10, true);
            } else {
                // stopp the acceleration 
                this.ship.body.acceleration.set(0);
                this.ship.animations.play('stop', true);
            }

            if (this.cursors.left.isDown) {
                this.ship.body.angularVelocity = -300;
            } else if (this.cursors.right.isDown) {
                this.ship.body.angularVelocity = 300;
            } else {
                // stop the rotation
                this.ship.body.angularVelocity = 0;
            }

        } else {
            if (!this.tween.isRunning) {
                // start the next level
                this.game.state.start('Soon');
            }
        }
    },

    collisionHandler: function(ship, blackhole) {
        // arrêter sa rotation
        ship.body.angularVelocity = 0;

        // stoper le vaisseau
        ship.body.acceleration.set(0);

        // informer l'utilisateur de la fin
        this.text.setText("Congrats! You made it!");

        // lancer l'animation
        this.cutscene = true;

        // remove the collision with the world 
        ship.body.collideWorldBounds = false;

        this.tween = this.game.add.tween(this.ship);
        this.tween.to({
            angle: '+900',
            alpha: 0
        }, 3000, Phaser.Easing.Linear.None, true);
    },

    render: function() {
        //this.game.debug.spriteInfo(this.ship, 32, 100);
        // this.game.debug.body(this.blackhole);
    }
};