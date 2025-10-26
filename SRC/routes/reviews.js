const express = require('express');
const Joi = require('joi');
const db = require('../models');
const auth = require('../middleware/auth');
const router = express.Router();

const { Review } = db.sequelize.models;

router.get('/', async (req, res) => {
  try {
    const reviews = await Review.findAll();
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }
    res.status(200).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/service/:serviceId', async (req, res) => {
  const serviceId = Number(req.params.serviceId);
  try {
    const reviews = await Review.findAll({ where: { serviceId } });
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', auth, async (req, res) => {
  const reviewSchema = Joi.object({
    custId: Joi.number().integer().positive().required(),
    serviceId: Joi.number().integer().positive().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(1000)
  });

  try {
    await reviewSchema.validateAsync(req.body);
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [updated] = await Review.update(req.body, { where: { reviewId: id } });
    if (updated) {
      const review = await Review.findByPk(id);
      res.status(200).json(review);
    } else {
      res.status(404).json({ msg: 'Review not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const deleted = await Review.destroy({ where: { reviewId: id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ msg: 'Review not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;