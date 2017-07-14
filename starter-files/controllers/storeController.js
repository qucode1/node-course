const mongoose = require('mongoose')
const Store = mongoose.model('Store')
const multer = require('multer')
const jimp = require('jimp')
const uuid = require('uuid')

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith('image/')
    if(isPhoto) {
      next(null, true)
    } else {
      next({message: 'That filetype isn\'t allowed!'}, false)
    }
  }
}

exports.homepage = (req, res) => {
  res.render('index', { title: 'Home'})
}

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add a Store'})
}

exports.upload = multer(multerOptions).single('photo')

exports.resize = async(req, res, next) => {
  //check if there is no new file to resize
  if(!req.file) {
    next()
    return
  }
  const extension = req.file.mimetype.split('/')[1]
  req.body.photo = `${uuid.v4()}.${extension}`
  const photo = await jimp.read(req.file.buffer)
  await photo.resize(800, jimp.AUTO)
  await photo.write(`./public/uploads/${req.body.photo}`)
  next()
}

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save()
  req.flash('success', `Created ${store.name}. Care to leave a review?`)
  res.redirect(`/stores/${store.slug}`)
}

exports.getStore = async (req, res) => {
  const stores = await Store.find()
  res.render('stores', { title: 'Stores', stores})
}

exports.getOneStore = async (req, res) => {
  let key = Object.keys(req.params)[0]
  const value = req.params[key]
  if(key === 'id') key = '_id'
  let query = {}
  query[key] = value
  const store = await Store.findOne(query)
  res.render('store', { title: `${store.name}`, store})
}

exports.editStore = async (req, res) => {
  const store = await Store.findOne( { _id: req.params.id })
  res.render('editStore', { title: `Edit ${store.name}`, store})
}

exports.updateStore = async (req, res) => {
  const store = await Store.findOneAndUpdate( { _id: req.params.id }, req.body, {
    new: true, // return new store instead of old one
    runValidators: true
  }).exec()
  req.flash('success', `Successfully updated <strong>${store.name}</strong>. <a href='/stores/${store.slug}'>View Store </a>`)
  res.redirect(`/stores/${store._id}/edit`)
}

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag
  const tagQuery = tag || { $exists: true }
  const tagsPromise = Store.getTagsList()
  const storesPromise = Store.find({ tags: tagQuery})
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise])
  res.render('tag', { title: 'Tags', tag, tags, stores })
}
