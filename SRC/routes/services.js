const express = require('express');
const Joi = require('joi');
const db = require('../models');
const auth = require('../middleware/auth');
const staff = require('../middleware/staff');
const router = express.Router();

const { Service } = db.sequelize.models;

router.get('/', async (req, res) => {
  try {
    const { sortBy, sortOrder, minPrice, maxPrice, name, minDuration, maxDuration } = req.query;
    
    const whereClause = {};
    
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[db.Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[db.Op.lte] = parseFloat(maxPrice);
    }
    
    if (name) {
      whereClause.name = { [db.Op.iLike]: `%${name}%` };
    }
    
    if (minDuration || maxDuration) {
      whereClause.duration = {};
      if (minDuration) whereClause.duration[db.Op.gte] = parseInt(minDuration);
      if (maxDuration) whereClause.duration[db.Op.lte] = parseInt(maxDuration);
    }
    
    const orderClause = [];
    if (sortBy) {
      const validSortFields = ['name', 'price', 'duration', 'createdAt'];
      if (validSortFields.includes(sortBy)) {
        const direction = sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        orderClause.push([sortBy, direction]);
      }
    }
    
    const services = await Service.findAll({
      where: whereClause,
      order: orderClause.length > 0 ? orderClause : [['createdAt', 'DESC']]
    });
    
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ msg: 'Service not found' });
    }
    res.status(200).json(service);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', [auth, staff], async (req, res) => {
  const serviceSchema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500),
    price: Joi.number().positive().precision(2).required(),
    duration: Joi.number().integer().positive()
  });

  try {
    await serviceSchema.validateAsync(req.body);
    const service = await Service.create(req.body);
    res.status(201).json(service);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', [auth, staff], async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [updated] = await Service.update(req.body, { where: { serviceId: id } });
    if (updated) {
      const service = await Service.findByPk(id);
      res.status(200).json(service);
    } else {
      res.status(404).json({ msg: 'Service not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', [auth, staff], async (req, res) => {
  const id = Number(req.params.id);
  try {
    const deleted = await Service.destroy({ where: { serviceId: id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ msg: 'Service not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;