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

storeSchema.pre('save', async function(next) {
  if(!this.isModified('name')) {
    next()
    return
  }
  this.slug = slug(this.name)
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)`, 'i')
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx})
  if(storesWithSlug.length) {
    let indices = storesWithSlug.map((store) => store.slug.split('-')[1])
    indices.sort((a, b) => (b - a))
    this.slug = `${this.slug}-${Number(indices[0]) + 1}`
  }
  next()
})

storeSchema.statics.getTagsList = function () {
  return this.aggregate([
    { $unwind: '$tags'},
    { $group: { _id: '$tags', count: { $sum: 1}}},
    { $sort: { count: -1}}
  ])
}

module.exports = mongoose.model('Store', storeSchema)
