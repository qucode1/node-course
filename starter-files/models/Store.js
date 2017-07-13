const mongoose = require('mongoose')
mongoose.Promise =  global.Promise
const slug = require('slugs')


const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: 'Please enter the store name!'
  },
  slug: String,
  description: {
    type: String,
    trim: true
  },
  photo: String,
  tags: [String],
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    adress: {
      type: String,
      required: 'You must provide an andress!'
    },
    coordinates: [{
      type: Number,
      required: 'You must provide a coordinates!'
    }]
  }
})

storeSchema.pre('save', function(next) {
  if(!this.isModified('name')) {
    next()
    return
  }
  this.slug = slug(this.name)
  next()
  // to-do make slugs unique
})
module.exports = mongoose.model('Store', storeSchema)
