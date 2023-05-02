import { Game } from "./GameEngine.js"
import { Entity } from "./Entity.js"

export const EnemyConfig = {
    size: [32, 32]
}
export class Enemy extends Entity {
    width = EnemyConfig.size[0]
    height = EnemyConfig.size[1]

    fireColors = ["black", "rgb(100,0,0)", ...Array(5).fill("rgb(255,0,0)"), "rgb(100,0,0)", "rgb(0,0,0)"] //, "rgb(50,0,0)", "rgb(255, 255 ,255)"
    isAlive = true
    constructor(parent, idx) {
        super({ name: "enemy" + idx })
        this.parent = parent
    }

    destroy() {
        this.isAlive = false
        this.color = 'transparent'
        super.destroy()
    }

    fire() {
        this.currentAnimation = this.fireColors
        this.onAnimation = true
    }

}