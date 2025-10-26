const express = require('express');
const Joi = require('joi');
const db = require('../models');
const auth = require('../middleware/auth');
const staff = require('../middleware/staff');
const router = express.Router();

const { Order } = db.sequelize.models;

router.get('/', [auth, staff], async (req, res) => {
  try {
    const { sortBy, sortOrder, status, custId, prodId, minAmount, maxAmount, dateFrom, dateTo } = req.query;
    
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (custId) {
      whereClause.custId = parseInt(custId);
    }
    
    if (prodId) {
      whereClause.prodId = parseInt(prodId);
    }
    
    if (minAmount || maxAmount) {
      whereClause.totalAmount = {};
      if (minAmount) whereClause.totalAmount[db.Op.gte] = parseFloat(minAmount);
      if (maxAmount) whereClause.totalAmount[db.Op.lte] = parseFloat(maxAmount);
    }
    
    if (dateFrom || dateTo) {
      whereClause.orderDate = {};
      if (dateFrom) whereClause.orderDate[db.Op.gte] = new Date(dateFrom);
      if (dateTo) whereClause.orderDate[db.Op.lte] = new Date(dateTo);
    }
    
    const orderClause = [];
    if (sortBy) {
      const validSortFields = ['orderDate', 'totalAmount', 'status', 'quantity', 'custId', 'prodId', 'createdAt'];
      if (validSortFields.includes(sortBy)) {
        const direction = sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        orderClause.push([sortBy, direction]);
      }
    }
    
    const orders = await Order.findAll({
      where: whereClause,
      order: orderClause.length > 0 ? orderClause : [['orderDate', 'DESC']]
    });
    
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const orderSchema = Joi.object({
    custId: Joi.number().integer().positive().required(),
    prodId: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().positive().required(),
    totalAmount: Joi.number().positive().precision(2).required()
  });

  try {
    await orderSchema.validateAsync(req.body);
    const order = await Order.create(req.body);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', [auth, staff], async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [updated] = await Order.update(req.body, { where: { orderId: id } });
    if (updated) {
      const order = await Order.findByPk(id);
      res.status(200).json(order);
    } else {
      res.status(404).json({ msg: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', [auth, staff], async (req, res) => {
  const id = Number(req.params.id);
  try {
    const deleted = await Order.destroy({ where: { orderId: id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ msg: 'Order not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;