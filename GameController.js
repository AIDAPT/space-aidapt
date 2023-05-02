import { EnemyController } from "./EnemyController.js"
import { Player } from "./Player.js"
import { Life } from "./Life.js"
import { Bullet } from "./Bullet.js"
import { CanvasItem, Game, checkOverlap, GameState, EntityTypes } from "./GameEngine.js"
export class GameController extends CanvasItem {
    bulletpool = []
    player
    enemyController
    gameStateTextItem
    lifePointContainer
    score
    points = 0

    constructor() {
        super({ name: "GameController" })
        this.enemyController = new EnemyController({ onEnemyFire: this.onEnemyFire.bind(this), onGameEnd: this.onGameEnd.bind(this) })
        this.player = new Player({ onFire: this.onPlayerFire.bind(this), onDead: this.onPlayerDead.bind(this) })
        this.gameStateTextItem = new CanvasItem()
        this.gameStateTextItem.position = [Game.width / 2, Game.height / 2]
        this.gameStateTextItem.type = EntityTypes.text
        this.gameStateTextItem.font = '200px serif'
        this.gameStateTextItem.color = 'transparent'
        this.gameStateTextItem.textAlign = 'center'
        this.lifePointContainer = [
            new Life(),
            new Life(),
            new Life()
        ]
        this.score = new CanvasItem()
        this.score.color = "black"
        this.score.position = [5, Game.height - 28]
        this.score.type = EntityTypes.text
        this.score.font = "28px serif"
        this.score.update = () => {
            this.score.text = `Score ${this.points}`
        }
    }

    onPlayerFire() {
        this.onFire(this.player, -1)
    }

    onEnemyFire(aliveEnemies) {
        if (aliveEnemies.length) {
            let randIdx = Math.round(Math.random() * (aliveEnemies.length - 1))
            let enemy = aliveEnemies[randIdx]
            //console.log(aliveEnemies, randIdx, enemy)
            if (enemy && enemy.isAlive) {
                enemy.fire()
                this.onFire(enemy, 1)
            }
        }
    }

    onFire(entity, direction) {
        let bullet = new Bullet()
        bullet.direction = direction
        bullet.position = [...entity.position]
        bullet.position[0] += entity.width / 2
        this.bulletpool.push(bullet)
    }

    update(delay) {
        let res = this.bulletpool.reduce((pre, bullet) => {
            if (bullet.direction === 1 ? bullet.position[1] > Game.height : bullet.position[1] < -bullet.height) {
                pre.destroyBullets.push(bullet)
            } else {
                pre.aliveBullets.push(bullet)
            }
            return pre
        }, { aliveBullets: [], destroyBullets: [] })

        let enemyList = this.enemyController.entityList.filter(e => !!e)
        if (enemyList.length > 0) {
            enemyList.forEach((enemy, eidx) => {
                res.aliveBullets.forEach((bullet, idx) => {
                    if (bullet.direction === -1)
                        if (checkOverlap(enemy, bullet)) {
                            enemy.destroy()
                            delete this.enemyController.entityList[eidx]
                            bullet.destroy()
                            delete res.aliveBullets[idx]
                            this.points += 20
                        }
                })

                if (checkOverlap(this.player, enemy)) {
                    enemy.destroy()
                    delete this.enemyController.entityList[eidx]
                    this.loose();
                    this.onPlayerDead()
                }
            })
            res.aliveBullets.forEach((bullet, idx) => {
                if (bullet.direction === 1 && checkOverlap(this.player, bullet)) {
                    bullet.destroy()
                    delete res.aliveBullets[idx]
                    this.player.hit()
                }
            })


        } else {
            console.log("WIN", this.id)
            this.destroy()
        }
        this.bulletpool = res.aliveBullets
        res.destroyBullets.forEach((bullet) => {
            bullet.destroy()
        })

        const x = Game.width / 2 - (Life.size * 1.5 + 5)
        this.lifePointContainer.forEach((life, idx) => {
            life.position = [x + (Life.size + 5) * idx, Game.height - Life.size]
            life.color = idx <= this.player.life ? 'red' : 'rgba(255,0,0,0.1)'
        })
    }

    onPlayerDead() {
        this.loose();
    }

    loose() {
        this.stopGame()
        this.player.hit(true);
        console.log("LOOSE", this.id)

    }

    stopGame() {
        this.enemyController.destroy()
        this.player.destroy()
        this.destroy()
    }

    onGameEnd(state) {
        console.log("state:", state)
        switch (state) {
            case GameState.LOOSE:
                this.gameStateTextItem.text = "LOOSE"
                this.gameStateTextItem.color = 'red'

                break
            case GameState.WIN:
                this.gameStateTextItem.text = "WIN"
                this.gameStateTextItem.color = 'green'
        }
        setTimeout(() => {
            this.stopGame()
        }, 100)
    }

    destroy() {
        super.destroy()
        this.enemyController.destroy()
    }
}

