
import { CanvasItem, Game, GameState } from "./GameEngine.js"
import { Enemy, EnemyConfig } from "./Enemy.js"
export class EnemyController extends CanvasItem {
    color = 'transparent'
    enemymap = [
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
    ]
    enemyPool = [

    ]

    entityList = []
    gap = 8
    state = 0
    direction = 1
    speed = 500
    fireInterval

    constructor({ onEnemyFire, onGameEnd }) {
        super({ name: "EntityController" })
        this.onEnemyFire = onEnemyFire
        this.onGameEnd = onGameEnd
        this.enemymap.forEach((row, i) => {
            this.enemyPool.push([])
            row.forEach((type, j) => {
                const enemy = new Enemy(this, j + (i * this.enemymap[0].length))
                enemy.position = [this.cellPos(j, 0), this.cellPos(i, 1)]
                enemy.isAlive = type !== null
                if (!enemy.isAlive)
                    enemy.color = 'transparent'
                this.enemyPool[i].push(enemy)
                this.entityList.push(enemy)
            })
        })
        //console.log(this.enemyPool)
        this.width = this.cellPos(this.enemymap[0].length, 0) - this.gap
        this.height = this.cellPos(this.enemymap.length, 1) - this.gap
        this.fireInterval = setInterval(() => {
            this.fire()
        }, 1000)
    }

    update(delay) {
        if (!(this.position[0] >= 0 && (this.position[0] + this.width) <= Game.width)) {
            if (this.position[0] < 0) {
                this.position[0] = 0
            }
            if ((this.position[0] + this.width > Game.width)) {
                this.position[0] = Game.width - this.cellPos(this.enemymap[0].length, 0)
            }
            this.position[1] += EnemyConfig.size[1] / 2 + this.gap
            if (this.position[1] + this.height >= Game.endLine) {
                this.onGameEnd(GameState.LOOSE)
            }
            this.direction *= -1
        }
        this.velocity = [this.direction * this.speed * delay, 0]
        this.enemyPool.forEach((row, i) => {
            row.forEach((enemy, j) => {
                enemy.position = [this.cellPos(j, 0) + this.position[0], this.cellPos(i, 1) + this.position[1]]
            })
        })
    }

    cellPos(index, axis) {
        return (index * EnemyConfig.size[axis] + this.gap * index)
    }

    fire() {
        //prendo tutti gli enemy sull'ultima riga
        let aliveEnemies = Array(this.enemymap[0].length).fill(null)
        for (let row of [...this.enemyPool].reverse()) {
            row.forEach((enemy, j) => {
                if (!aliveEnemies[j]) {
                    if (enemy.isAlive) aliveEnemies[j] = enemy
                }
            })
            if (aliveEnemies.every((e) => !!e))
                break
        }
        this.onEnemyFire(aliveEnemies)
    }

    destroy() {
        super.destroy()
        this.fireInterval && clearInterval(this.fireInterval)
    }
}