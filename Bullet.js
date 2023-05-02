import { CanvasItem } from "./GameEngine.js";
export class Bullet extends CanvasItem {
    width = 3
    height = 8
    color = 'black'
    direction = 1
    speed = 150

    constructor() {
        super({ name: 'bullet' })
    }

    update(delay) {
        this.velocity[1] = this.speed * delay * this.direction
    }
}