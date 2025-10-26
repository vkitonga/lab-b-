const express = require('express');
const db = require('../models');
const bcrypt = require('bcrypt');
const router = express.Router();

const { Customer, Staff } = db.sequelize.models;

router.post('/customer/login', async(req, res) => {
  const { email, password } = req.body;
  try {
    const customer = await Customer.findOne({ where: { email }});
    if(!customer){
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }
    const isMatch = await bcrypt.compare(password, customer.password);
    if(!isMatch){
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }
    const payload = {
      user: {
        custId: customer.custId,
        staffId: null,
        name: customer.name,
        email: customer.email,
        role: customer.role
      }
    }
    const token = await Customer.prototype.signToken(payload);
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({errors: [{ msg: 'Server Error'}] });
  }
});

router.post('/customer/register', async (req, res) => {
  const { name, email, address, phone, password } = req.body;
  try {
    let customer = await Customer.findOne({ where: { email }});
    if(customer) {
      return res.status(400).json({ errors: [{ msg: 'User already registered' }] });
    }
    const hashedPassword = await Customer.prototype.hashPwd(password);
    const custRes = await Customer.create({
      name,
      email,
      address,
      phone,
      password: hashedPassword
    });
    const payload = {
      user: {
        custId: custRes.custId,
        staffId: null,
        name: custRes.name,
        email: custRes.email,
        role: custRes.role
      }
    }
    const token = await Customer.prototype.signToken(payload);
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({errors: [{ msg: 'Server Error'}] });
  }
});

router.post('/staff/login', async(req, res) => {
  const { email, password } = req.body;
  try {
    const staff = await Staff.findOne({ where: { email }});
    if(!staff){
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }
    const isMatch = await bcrypt.compare(password, staff.password);
    if(!isMatch){
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }
    const payload = {
      user: {
        custId: null,
        staffId: staff.staffId,
        name: staff.name,
        email: staff.email,
        role: staff.role
      }
    }
    const token = await Customer.prototype.signToken(payload);
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({errors: [{ msg: 'Server Error'}] });
  }
});

router.post('/staff/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let staff = await Staff.findOne({ where: { email }});
    if(staff) {
      return res.status(400).json({ errors: [{ msg: 'User already registered' }] });
    }
    const hashedPassword = await Customer.prototype.hashPwd(password);
    const staffRes = await Staff.create({
      name,
      email,
      password: hashedPassword
    });
    const payload = {
      user: {
        custId: null,
        staffId: staffRes.staffId,
        name: staffRes.name,
        email: staffRes.email,
        role: staffRes.role
      }
    }
    const token = await Customer.prototype.signToken(payload);
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({errors: [{ msg: 'Server Error'}] });
  }
});

module.exports = router;