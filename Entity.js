import { CanvasItem } from "./GameEngine.js"
export class Entity extends CanvasItem {
    life = 1

    constructor({ ...props }) {
        super({ ...props, mouseenter: true })
    }

}