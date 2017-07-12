const Store = require('../models/Store')

exports.homepage = (req, res) => {
  res.render('index', { title: 'Home'})
}

exports.addStore = (req, res) => {
  res.render('editStore', { title: 'Add a Store'})
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
