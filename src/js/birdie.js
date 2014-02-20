var game = new Phaser.Game(480, 640, Phaser.CANVAS, 'game-canvas', { preload: preload, create: create, update: update, render: render});

var bird;
var button;
var crashSound;
var flapSounds = [];
var isAlive = false;
var score = 0;
var scoreText;
var tapped = false;
var timer = 0;
var logo;
var pipes;
var pipesReference = [];

var flyStrength = -200;
var groundSpeed = 3;
var pipeDistance = 250;

function preload() {
    // Load images
    game.load.image('pipeTop',    'assets/open.commonly.cc/kenney/pokerMad.png');
    game.load.image('pipeBottom', 'assets/open.commonly.cc/kenney/pokerSad.png');
    game.load.image('ground',     'assets/open.commonly.cc/kenney/grassHalf.png');
    game.load.image('background', 'assets/open.commonly.cc/jimp/bg0.png');
    game.load.image('logo',       'assets/flaplike-logo.png');

    // Load sounds
    game.load.audio('flap1', ['assets/sounds/flap1.mp3', 'assets/sounds/flap1.ogg']);
    game.load.audio('flap2', ['assets/sounds/flap2.mp3', 'assets/sounds/flap2.ogg']);
    game.load.audio('flap3', ['assets/sounds/flap3.mp3', 'assets/sounds/flap3.ogg']);
    game.load.audio('flap4', ['assets/sounds/flap4.mp3', 'assets/sounds/flap4.ogg']);
    game.load.audio('crash', ['assets/sounds/crash.mp3', 'assets/sounds/crash.ogg']);

    // Load button
    game.load.spritesheet('button', 'assets/button_sprite_sheet.png', 193, 71);

    // Load animation
    game.load.atlasJSONHash(
        'birdAtlas', // name it
        'assets/open.commonly.cc/jimp/fluppit/Fluppit.png', // image
        'assets/open.commonly.cc/jimp/fluppit/Fluppit.json' // json
    );

    // Set game size
    game.stage.scale.maxWidth = 640;
    game.stage.scale.maxHeight = 960;

    // Set touch pointers to 1, don't need multitouch
    this.game.input.maxPointers = 1;

    // Make game cover full browser window
    game.stage.scaleMode = Phaser.StageScaleMode.SHOW_ALL;
    game.stage.scale.setShowAll();
    window.addEventListener('resize', function () {
      game.stage.scale.refresh();
    });
    game.stage.scale.refresh();

    if (this.game.device.desktop)
    {
        //  If you have any desktop specific settings, they can go in here
        this.game.stage.scale.pageAlignHorizontally = true;
    }
    else
    {
        //  Same goes for mobile settings.
        this.game.stage.scale.forceLandscape = true;
        this.game.stage.scale.pageAlignHorizontally = true;
        this.game.stage.scale.setScreenSize(true);
    }
}

function create() {


    // Add all sounds to an array
    flapSounds.push(game.add.audio('flap1'));
    flapSounds.push(game.add.audio('flap2'));
    flapSounds.push(game.add.audio('flap3'));
    flapSounds.push(game.add.audio('flap4'));

    // Load the crash sound
    crashSound = game.add.audio('crash');
    crashSound.volume = 0.5;

    createPipes();
    createGround();
    createBird();

    // Add the background
    var background = game.add.sprite(-250, 0, 'background');
    logo = game.add.sprite(game.world.centerX - 240, 100, 'logo');

    // Scale up background
    background.scale.x = 1.3;
    background.scale.y = 1.3;

    // Add the score
    scoreText = game.add.text(16, 16, 'Score: 0', { font: '22px arial', fill: '#fff' });

    // Add the start button
    button = game.add.button(game.world.centerX - 95, 400, 'button', startGame, this, 2, 1, 0);
}

function startGame () {
    // Reset variables
    button.visible = false;
    logo.visible = false;
    score = 0;
    timer = 0;
    isAlive = true;

    // Remove all objects
    bird.kill();
    pipes.forEach(function(item) {
        item.kill();
    });
    ground.forEach(function(item) {
        item.kill();
    });

    // Create all items
    createPipes();
    createGround();
    createBird();

    scoreText.content = 'Score: ' + score;
}

function createBird() {
    // Add bird
    bird = game.add.sprite(
        game.world.centerX, // x position
        game.world.centerY, // y position
        'birdAtlas'         // image
    );

    // Set anchor point to middle
    bird.anchor.setTo(0.5, 0.5);

    // Add an animation
    bird.animations.add('flap-wings', Phaser.Animation.generateFrameNames('Fluppit', 0, 8, '', 4), 30, true);

    bird.animations.add('crash', Phaser.Animation.generateFrameNames('Fluppit', 9, 18, '', 4), 30, true);

    // Scale down bird
    bird.scale.x = 0.8;
    bird.scale.y = 0.8;

    // Flip horizontal
    bird.scale.x = -bird.scale.x;

    // Bird gravity
    bird.body.bounce.y = 0.6;
    bird.body.gravity.y = 400;
    bird.body.collideWorldBounds = true;
    bird.angle -= 40;

    // Collission box for bird is too big!
    bird.body.setRectangle(75, 75, 60, 70);
}

function createGround() {
    // Add group for ground objects
    ground = game.add.group();

    // Create 8 ground objects
    for (var i = 0; i < 8; i++) {
        var imageSize = 70;
        var positionX = (i * imageSize);

        var groundPiece = ground.create(positionX, game.world.height, 'ground');
        groundPiece.anchor.setTo(0, 0.5);
        groundPiece.body.immovable = true;
    }

}

function createPipes() {
    // Add group for pipes
    pipes = game.add.group();

    for (var i = 0; i < 4; i++) {
        // Calculate the positions
        var offset = game.world.width;
        var positionX = (i * pipeDistance);

        // Make the top pipe
        var pipeTop = pipes.create(offset + positionX, 0, 'pipeTop');
        pipeTop.angle = 180;
        pipeTop.anchor.setTo(0.5, 0.5);

        // Make the bottom pipe
        var pipeBottom = pipes.create(offset + positionX, game.world.height + 100, 'pipeBottom');
        pipeBottom.anchor.setTo(0.5, 1);

        // Save references for later
        pipesReference.push([pipeTop, pipeBottom]);
    }
}

function collision(obj1, obj2) {
    // You have dieded
    isAlive = false;

    // Play sound and animations
    crashSound.play();
    bird.animations.play('crash', 20, false);

    // Show start button and logo
    button.visible = true;
    button.bringToTop();
    logo.visible = true;
    logo.bringToTop();
}

function tap() {
    if (isAlive === true) {
        bird.animations.play('flap-wings', 60, false);
        bird.body.velocity.y = flyStrength;
        bird.angle = -40;

        flapSounds[Math.floor(Math.random()*4)].play();

        tapped = true;
    }
}

function setPipeHeight(pipeTop, pipeBottom) {
    var difference = (Math.random() * 250) - 125;

    pipeTop.y = 0 + difference;
    pipeBottom.y = game.world.height + 100 + difference;
}

function update() {
    if (isAlive === false) {
        return;
    }

    if ((game.input.mousePointer.isDown || game.input.pointer1.isDown) && tapped === false) {
        tap();
    }

    if ((game.input.mousePointer.isUp) && tapped === true) {
        tapped = false;
    }

    if (bird.angle < 40) {
        bird.angle += 1;
    }

    pipesReference.forEach(function(items) {
        var pipeTop = items[0];
        var pipeBottom = items[1];

        pipeTop.x -= groundSpeed;
        pipeBottom.x -= groundSpeed;

        if (pipeTop.x < 0 - pipeDistance ) {
            pipeTop.x = pipeDistance * 3;
            pipeBottom.x = pipeDistance * 3;

            setPipeHeight(pipeTop, pipeBottom);
        }
    });

    ground.forEach(function(item) {
        item.x -= groundSpeed;

        if (item.x < 0 - 70 ) {
            item.x = 70 * 7;
        }
    });

    game.physics.collide(bird, pipes,  collision, null, this);
    game.physics.collide(bird, ground, collision, null, this);

    timer++;
    if(timer >= pipeDistance/3) {
        score += 1;
        scoreText.content = 'Score: ' + score;
        timer = 0;
    }
}

function render() {
    // Need Phaser.CANVAS in Phaser.Game() constructor for these to work:

    // game.debug.renderBodyInfo(bird, 32, 32);

    // game.debug.renderPhysicsBody(bird.body);

    // pipes.forEach(function(item) {
    //     game.debug.renderPhysicsBody(item.body);
    // });

    // ground.forEach(function(item) {
    //     game.debug.renderPhysicsBody(item.body);
    // });
}

