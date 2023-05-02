
window.keys = {};
window.onkeyup = function (e) { window.keys[e.code] = false; }
window.onkeydown = function (e) { window.keys[e.code] = true; }

let main;
let delay
let ot = 0


export const GameState = {
    RUN: 'run',
    LOOSE: 'loose',
    WIN: 'win',
}
class GameClass {
    state = GameState.RUN
    fps = 0
    padding = 20
    mousePos = [0, 0]

    constructor() {
        const canvas = document.getElementById('main')
        const ctx = canvas.getContext("2d")
        canvas.width = 800
        canvas.height = 400
        this.width = canvas.clientWidth
        this.height = canvas.clientHeight
        this.endLine = this.height - 50
        this.ctx = ctx
        this.canvas = canvas
    }

    start(debug) {
        const gameLoop = (time) => {
            delay = (time - ot) / 1000
            ot = time
            this.fps = Math.round(1 / delay)

            this.ctx.fillStyle = "white";
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            window.dispatchEvent(new CustomEvent("update", {
                detail: {
                    delay
                }
            }))
            window.requestAnimationFrame(gameLoop)
        }
        window.addEventListener('mousemove', (e) => {
            var rect = this.canvas.getBoundingClientRect();
            this.mousePos = [e.clientX - rect.x, e.clientY - rect.y]
        })
        window.requestAnimationFrame(gameLoop)
        debug && this.startDebug()
    }


    startDebug() {

        const fpsdebug = new CanvasItem({ name: "debug" })
        fpsdebug.type = EntityTypes.text
        fpsdebug.font = "28px serif"
        fpsdebug.position = [4, Game.endLine - 5]
        fpsdebug.update = (delay) => {
            fpsdebug.text = "FPS:" + Game.fps
        }
    }

}
export const Game = new GameClass()

export const EntityTypes = {
    placeholder: "placeholder",
    point: "point",
    sprite: "sprite",
    text: "text",
}



export class CanvasItem {
    parent = null
    position = [0, 0]
    velocity = [0, 0]
    sprite = null
    width = 0
    height = 0
    color = "black"
    type = EntityTypes.placeholder
    font = null
    text = ""
    animationIdx = 0
    animationCallback = null

    textAlign = 'start'



    constructor(props) {
        this.id = Math.round(Math.random() * 1000000000)
        this.props = {
            mouseenter: false,
            ...props
        }
        //console.log("created", this.id, this.props.name || props)
        this.updateEventHandler = (e) => {
            this.update && this.update(e.detail.delay)
            this.repaint && this.repaint()
        }
        this.create()
    }
    create() {
        addEventListener("update", this.updateEventHandler)
        this.animation = setInterval(() => {
            this.animate()
        }, 100)
    }
    update(delay) { }
    destroy() {
        removeEventListener("update", this.updateEventHandler)
        this.animation && clearInterval(this.animation)
    }

    animate() {
        if (this.onAnimation) {
            this.animationIdx++
            if (this.animationIdx > this.currentAnimation.length - 1) {
                this.onAnimation = false
                this.animationIdx = 0
                this.animationCallback?.()
            } else
                this.color = this.currentAnimation[this.animationIdx]
        }
    }

    repaint() {
        const ctx = Game.ctx
        ctx.fillStyle = this.color;

        if (this.props.mouseenter) {
            let a = new DOMRect(this.position[0], this.position[1], this.width, this.height)
            const b = {
                position: [Game.mousePos[0], Game.mousePos[1]],
                heigth: 0,
                width: 0
            }
            if (checkOverlap(this, b)) {
                ctx.font = '16px serif'
                ctx.fillStyle = 'purple'
                ctx.fillText(`${this.props.name} [${a.x}, ${a.y}]`, 10, 18)
                ctx.font = null
            }

        }

        this.position[0] += this.velocity[0]
        this.position[1] += this.velocity[1]
        switch (this.type) {
            case EntityTypes.placeholder:
                ctx.fillRect(this.position[0], this.position[1], this.width, this.height);
                break;
            case EntityTypes.text:
                ctx.font = this.font
                ctx.textAlign = this.textAlign
                ctx.fillText(this.text, this.position[0], this.position[1])
                ctx.textAlign = 'start'
                ctx.font = null
                break;
        }
        ctx.fillStyle = null
    }
}

export function checkOverlap(elemA, elemB) {
    let a = new DOMRect(elemA.position[0], elemA.position[1], elemA.width, elemA.height)
    let b = new DOMRect(elemB.position[0], elemB.position[1], elemB.width, elemB.height)

    if (a.left >= b.right || a.top >= b.bottom ||
        a.right <= b.left || a.bottom <= b.top) {
        // no overlap
        return false
    }
    else {
        // overlap          
        return true
    }
}