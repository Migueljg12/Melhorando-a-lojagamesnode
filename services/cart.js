import { CartRepository } from '../models/index.js'
import Service from './service.js'
import { GameService } from './index.js'

export default class CartService extends Service {
  constructor() {
    super(CartRepository)
  }

  async addCart(game, _id) {

    const cart = await this.repository.findOne({ _id })

    const service = new GameService()

    let stock = async (param1, param2) => { return await service.checkStock(param1, param2) }

    let res = await stock(game, false)

    if ((cart === null && res === true) || (cart && (cart.payed && res === true))) {
      const model = this.repository(game)
      await model.save()
      return model
    }

    const { user, ...rest } = game
    try {

      for (let i of cart.gameInfo) {

        if (i.gameId === game.gameInfo.gameId && res === true) {

          i.amount += game.gameInfo.amount

          game.gameInfo.amount = i.amount

          res = await stock(game, true)

          if (res == true) {
            const model = this.repository(cart)
            await model.save()
            return model
          }
        }
      }

    } catch (e) {
      throw new Error(e)
    }

    if (res == true) {
      await this.repository.findOneAndUpdate({ _id: cart._id },
        ({ $push: rest }))
      return this.repository.findOne(_id)
    } else {

      throw new Error('Não temos a quantidade em estoque')
    }

    // } catch ({ message }) {
    //   throw new Error('Não temos a quantidade em estoque')
    // }
  }

  async paying(id) {
    const cart = await this.repository.findOne(id)
    const service = new GameService()

    const check = await service.checkPaying(cart)

    if (check.includes(false)) {

      throw new Error('Não tem unidades disponiveis')

    } else {

      await service.stockCount(cart)

      return await this.repository.findOneAndUpdate(id, { $set: { payed: true } })
    }
  }

  async delGame(params, body) {
    let cart = await this.repository.findOne(params)

    cart.gameInfo = cart.gameInfo.filter(element => element.gameId != body.gameId)

    return await cart.save()
  }

  async delete(_id) {
    return await this.repository.findOneAndDelete({ _id })
  }

  // async teste(body, params) {
  //   if (params === undefined) {
  //     let model = this.repository(body)
  //     await model.save()
  //     return model
  //   } else {
  //     let { gameInfo } = body
  //     return await this.repository.findOneAndUpdate({ _id: params }, ({ $push: { gameInfo } }))

  //     let cart = await this.repository.findOne(params)
  //     cart.gameInfo.push(body.gameInfo)
  //     await cart.save()
  //     return cart
  //   }
  // }
}
