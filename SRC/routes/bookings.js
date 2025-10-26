const express = require('express');
const Joi = require('joi');
const db = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

const { Booking } = db.sequelize.models;

router.get('/', auth, async (req, res) => {
  try {
    const { sortBy, sortOrder, status, custId, serviceId, dateFrom, dateTo } = req.query;
    
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (custId) {
      whereClause.custId = parseInt(custId);
    }
    
    if (serviceId) {
      whereClause.serviceId = parseInt(serviceId);
    }
    
    if (dateFrom || dateTo) {
      whereClause.bookingDate = {};
      if (dateFrom) whereClause.bookingDate[db.Op.gte] = new Date(dateFrom);
      if (dateTo) whereClause.bookingDate[db.Op.lte] = new Date(dateTo);
    }
    
    const orderClause = [];
    if (sortBy) {
      const validSortFields = ['bookingDate', 'status', 'custId', 'serviceId', 'createdAt'];
      if (validSortFields.includes(sortBy)) {
        const direction = sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        orderClause.push([sortBy, direction]);
      }
    }
    
    const bookings = await Booking.findAll({
      where: whereClause,
      order: orderClause.length > 0 ? orderClause : [['bookingDate', 'DESC']]
    });
    
    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const booking = await Booking.findByPk(id);
    if (!booking) {
      return res.status(404).json({ msg: 'Booking not found' });
    }
    res.status(200).json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const bookingSchema = Joi.object({
    custId: Joi.number().integer().positive().required(),
    serviceId: Joi.number().integer().positive().required(),
    bookingDate: Joi.date().required(),
    notes: Joi.string().max(500)
  });

  try {
    await bookingSchema.validateAsync(req.body);
    const booking = await Booking.create(req.body);
    res.status(201).json(booking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [updated] = await Booking.update(req.body, { where: { bookingId: id } });
    if (updated) {
      const booking = await Booking.findByPk(id);
      res.status(200).json(booking);
    } else {
      res.status(404).json({ msg: 'Booking not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const deleted = await Booking.destroy({ where: { bookingId: id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ msg: 'Booking not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;