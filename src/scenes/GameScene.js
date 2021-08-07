import Phaser from 'phaser'
import ScoreLabel from '../ui/ScoreLabel'
import BombSpawner from './BombSpawner'


export default class GameScene extends Phaser.Scene{
    constructor(){
        /**
         * Every class has a constructor and every scene needs an ID.
         * If we do not include the ID, Phaser will automatically give
         * it a random ID. We won't know what the ID is if we don't 
         * give it one.
         * 
         * We will be able to reference the scene by the ID.
         */
        super('hello-scene')
    }

    /**
     * Preload any assets like images, audio files, spites, etc..
     */
    preload(){

        //this.load.image('ASSET_ID', 'PATH_TO_ASSET_FROM_ROOT')
        this.load.image('sky', 'src/assets/sky.png')
        this.load.image('bomb', 'src/assets/bomb.png')
        this.load.image('ground', 'src/assets/platform.png')
        this.load.image('star', 'src/assets/star.png')

        this.load.spritesheet('dude', 'src/assets/dude.png', {
            frameWidth: 32, frameHeight: 48
        })

    }

    /**
     * Creates Game Objects based on the assets that were preloaded
     */
    create(){

        //the background image
        this.add.image(400, 300, 'sky')

        //create the platforms
        const platforms = this.createPlatforms()

        this.player = this.createPlayer()   //create the player
        this.physics.add.collider(this.player, platforms)   //player and platforms colliude

        this.cursors = this.input.keyboard.createCursorKeys()   //get arrow keys

        this.stars = this.createStars()    //create the stars
        this.physics.add.collider(this.stars, platforms) //stars collide with platforms

        /**
         * Detects an overlap between the player and the stars.
         * If there is an overlap, fire this.collectStar. On process
         * do null. 
         * 
         * this is the scope
         */
        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this)

        this.scoreLabel = this.createScoreLabel(16, 16, 0)

        // this.bombSpawner = new BombSpawner(this, 'bomb')
        // const bombGroup = this.BombSpawner.group
        // this.physics.add.collider(bombGroup, platforms)
    }

    createPlatforms(){
        const platforms = this.physics.add.staticGroup()

        //the ground
        platforms.create(400, 568, 'ground').setScale(2).refreshBody()

        //floating platforms
        platforms.create(600, 400, 'ground')
        platforms.create(50, 250, 'ground')
        platforms.create(750, 220, 'ground')

        return platforms
    }

    createPlayer(){
        const player = this.physics.add.sprite(100, 400, 'dude')
        player.setBounce(0.2)
        player.setCollideWorldBounds(true)

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'turn',
            frames: [{key:'dude', frame: 4}],
            frameRate: 20
        })

        return player
    }

    createStars(){
        const stars = this.physics.add.group({
            key: 'star',    //The key for the asset
            repeat: 11, //Make one at the start then another 11
            setXY: { x: 12, y: 0, stepX: 70}   //For each repeat, start at x y then for each new star add 70 to x
        })

        stars.children.iterate( (child) => {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8))    //each star will bounce at different heights
        })

        return stars
    }

    collectStar(player, star){
        star.disableBody(true, true)
        this.scoreLabel.add(10)

        if(this.stars.countActive(true) === 0){
            this.stars.children.iterate( (child) => {
                child.enableBody(true, child.x, 0, true, true )
            })
        }

        this.bombSpawner.spawn(player.x)
    }

    createScoreLabel(x, y, score){
        const style = { fontSize: '32px', fill: '#000'}
        const label = new ScoreLabel(this, x, y, score, style)

        this.add.existing(label)

        return label
    }

    update(){

        /**
         * Player Left, Right, Idle
         * 
         * While a key is pressed down, move the player and
         * play the frames for the sprite.
         */
        if(this.cursors.left.isDown){   //If the left key is down
            this.player.setVelocityX(-160)
            this.player.anims.play('left', true)
        } else if(this.cursors.right.isDown){   //If the right key is down
            this.player.setVelocityX(160)
            this.player.anims.play('right', true)
        } else {    //If there are no keys down
            this.player.setVelocityX(0)
            this.player.anims.play('turn')
        }


        /**
         * Making the Player Jump
         * 
         * If the up arrow key is down and the player is touching something below it.
         * The player will only be able to jump if they are on a platform.
         * This will remove the multiple jump feature.
         */
        if(this.cursors.up.isDown && this.player.body.touching.down){
            this.player.setVelocityY(-350)
        }
    }

    
}

// export default GameScene