const express = require('express');
const Joi = require('joi');
const db = require('../models');
const auth = require('../middleware/auth');
const staff = require('../middleware/staff');
const router = express.Router();

const { Payment } = db.sequelize.models;

router.get('/', [auth, staff], async (req, res) => {
  try {
    const payments = await Payment.findAll();
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const payment = await Payment.findByPk(id);
    if (!payment) {
      return res.status(404).json({ msg: 'Payment not found' });
    }
    res.status(200).json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const paymentSchema = Joi.object({
    bookingId: Joi.number().integer().positive().required(),
    amount: Joi.number().positive().precision(2).required(),
    paymentMethod: Joi.string().valid('card', 'cash', 'bank_transfer').required(),
    transactionId: Joi.string().max(100)
  });

  try {
    await paymentSchema.validateAsync(req.body);
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', [auth, staff], async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [updated] = await Payment.update(req.body, { where: { paymentId: id } });
    if (updated) {
      const payment = await Payment.findByPk(id);
      res.status(200).json(payment);
    } else {
      res.status(404).json({ msg: 'Payment not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;