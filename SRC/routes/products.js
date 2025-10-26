const express = require('express');
const Joi = require('joi');
const db = require('../models');
const auth = require('../middleware/auth');
const staff = require('../middleware/staff');
const router = express.Router();

const { Product } = db.sequelize.models;

router.get('/', async (req, res) => {
  try {
    const { sortBy, sortOrder, minPrice, maxPrice, name, inStock } = req.query;
    const whereClause = {};
    
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[db.Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[db.Op.lte] = parseFloat(maxPrice);
    }
    
    if (name) {
      whereClause.name = { [db.Op.iLike]: `%${name}%` };
    }
    
    if (inStock === 'true') {
      whereClause.stock = { [db.Op.gt]: 0 };
    }
    
    const orderClause = [];
    if (sortBy) {
      const validSortFields = ['name', 'price', 'stock', 'createdAt'];
      if (validSortFields.includes(sortBy)) {
        const direction = sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        orderClause.push([sortBy, direction]);
      }
    }
    
    const products = await Product.findAll({
      where: whereClause,
      order: orderClause.length > 0 ? orderClause : [['createdAt', 'DESC']]
    });
    
    res.status(200).send(products);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const product = await Product.findByPk(id);
    res.status(200).send(product);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', [auth, staff], async(req, res) => {
  const productSchema = Joi.object({
    name: Joi.string().regex(/^[a-zA-Z\s]*$/).min(3).max(30).required(),
    desc: Joi.string().regex(/^[a-zA-Z0-9\s]*$/).min(10).max(255),
    image: Joi.string().uri().allow(null),
    price: Joi.number().positive().precision(2),
    stock: Joi.number().integer().positive()
  });

  try {
    await productSchema.validateAsync(req.body);
    const product = await Product.create(req.body);
    res.status(201).send(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', [auth, staff], async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [updated] = await Product.update(req.body, {where: { prodId: id }});
    if(updated){
      const product = await Product.findByPk(id);
      res.status(200).send(product);
    } else {
      res.status(404).json({ msg: "Product not found"});
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.delete('/:id', [auth, staff], async (req, res) => {
  const id = Number(req.params.id);
  try {
    const deleted = await Product.destroy({ where: { prodId: id}});
    if(deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ msg: "Product not found"});
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/o/:field/:dir', async (req, res) => {
  const { field, dir } = req.params;
  try {
    const products = await Product.findAll({ order: [[field, dir]]});
    res.status(200).send(products);
  } catch (err) {
    res.status(500).json({ error: err.message});
  }
});

module.exports = router;