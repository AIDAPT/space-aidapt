import { Game } from "./GameEngine.js";
import { Entity } from "./Entity.js";
import { Life } from "./Life.js";
export class Player extends Entity {
    speed = 500
    canFire = false
    life = 2
    hasHitted = false
    hasDestroyed = false
    hitAnimation = [...Array(5).fill(1).map((_, i, arr) => `rgb(${255 - (255 * (i / (arr.length - 1)))},0,0)`)]
    destroyAnimation = [...Array(5).fill(1).map((_, i, arr) => {
        let c = 255 * (i / (arr.length - 1))
        return `rgb(${c},${c},${c})`
    })]
    canHit = true
    fireInterval
    constructor({ onFire, onDead }) {
        super({ name: 'player' })
        this.onDead = onDead
        this.width = 45
        this.height = 45
        this.color = 'black'
        this.onFire = onFire
        this.position = [(Game.width - this.width) / 2, Game.height - this.height - Life.size - 5]
    }

    update(delay) {
        let direction = window.keys.ArrowLeft ? -1 : window.keys.ArrowRight ? 1 : 0
        this.velocity = [this.speed * direction * delay, 0]
        let nextPos = [this.position[0] + this.velocity[0], this.position[1] + this.velocity[1]]
        let rect = new DOMRect(nextPos[0], nextPos[1], this.width, this.height)
        if (rect.left < 0 || rect.right > Game.width)
            this.velocity = [0, 0]
        window.keys.Space && !this.canFire && this.fire()
    }

    fire() {
        console.log("fire")
        this.onFire()
        this.canFire = true
        this.fireInterval = setTimeout(() => this.canFire = false, 10)

    }

    hit(forceDead = false) {
        console.log('hit!', this.life)
        if (this.canHit || forceDead) {
            if (forceDead)
                this.life = 0
            this.life--
            if (this.life >= 0) {
                this.canHit = false
                this.currentAnimation = this.hitAnimation
                this.animationCallback = () => {
                    this.canHit = true
                }
            } else {
                this.currentAnimation = this.destroyAnimation
                this.animationCallback = this.onDead //chiamo la funzione di gameover solo quando l'animazione di destroy è completeta
            }
            this.onAnimation = true
        }
    }

    destroy() {
        super.destroy()
        this.fireInterval && clearInterval(this.fireInterval)
    }
}