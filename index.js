import { Game, CanvasItem } from './GameEngine.js'
import { GameController } from "./GameController.js"

Game.start(true)
new GameController()
const line = new CanvasItem({})
line.color = "black"
line.width = Game.width
line.height = 1
line.position = [0, Game.endLine]



