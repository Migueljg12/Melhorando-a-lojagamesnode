import mongoose from 'mongoose'
const { Schema } = mongoose

const CartSchema = new Schema({
  gameInfo: [{
    gameId: String,
    amount: Number,
    _id: false,
  }],
  user: {
    type: String
  },
  payed: {
    type: Boolean,
    default: false
  }
})

export default mongoose.model('cart', CartSchema)
