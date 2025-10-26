const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

let db = {};

const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  config.db.options
);

const Products = sequelize.define('Products', {
  prodId: 
  {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  desc: { type: DataTypes.TEXT},
  image: {type: DataTypes.STRING},
  price: { type: DataTypes.DECIMAL(10, 2)},
  stock: { type: DataTypes.INTEGER}
});

const Customer = sequelize.define('Customer', {
  custId: 
  {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  address: {type: DataTypes.STRING},
  phone: { type: DataTypes.STRING},
  password: { type: DataTypes.STRING, allowNull: false},
  role: { type: DataTypes.STRING, defaultValue: 'customer'}
});

const Staff = sequelize.define('Staff', {
  staffId: 
  {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false},
  role: { type: DataTypes.STRING, defaultValue: 'staff'}
});

const Service = sequelize.define('Service', {
  serviceId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  duration: { type: DataTypes.INTEGER }
});

const Booking = sequelize.define('Booking', {
  bookingId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  custId: { type: DataTypes.INTEGER, allowNull: false },
  serviceId: { type: DataTypes.INTEGER, allowNull: false },
  bookingDate: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  notes: { type: DataTypes.TEXT }
});

const Payment = sequelize.define('Payment', {
  paymentId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  bookingId: { type: DataTypes.INTEGER, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  paymentMethod: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  transactionId: { type: DataTypes.STRING }
});

const Review = sequelize.define('Review', {
  reviewId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  custId: { type: DataTypes.INTEGER, allowNull: false },
  serviceId: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  comment: { type: DataTypes.TEXT },
  reviewDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const Order = sequelize.define('Order', {
  orderId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  custId: { type: DataTypes.INTEGER, allowNull: false },
  prodId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  orderDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

Customer.prototype.signToken = function(payload){
  return jwt.sign(payload, config.auth.jwtSecret, { 
    expiresIn: '7d',
    algorithm: 'HS512'
  });
}

Customer.prototype.hashPwd = async function(password){
  const salt = await bcrypt.genSalt(11);
  return await bcrypt.hash(password, salt);
}

Staff.prototype.signToken = Customer.prototype.signToken;
Staff.prototype.hashPwd = Customer.prototype.hashPwd;

Customer.hasMany(Order, { foreignKey: 'custId' });
Order.belongsTo(Customer, { foreignKey: 'custId' });
Products.hasMany(Order, { foreignKey: 'prodId' });
Order.belongsTo(Products, { foreignKey: 'prodId' });
Customer.hasMany(Booking, { foreignKey: 'custId' });
Booking.belongsTo(Customer, { foreignKey: 'custId' });
Service.hasMany(Booking, { foreignKey: 'serviceId' });
Booking.belongsTo(Service, { foreignKey: 'serviceId' });
Booking.hasOne(Payment, { foreignKey: 'bookingId' });
Payment.belongsTo(Booking, { foreignKey: 'bookingId' });
Customer.hasMany(Review, { foreignKey: 'custId' });
Review.belongsTo(Customer, { foreignKey: 'custId' });
Service.hasMany(Review, { foreignKey: 'serviceId' });
Review.belongsTo(Service, { foreignKey: 'serviceId' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
module.exports.Op = Sequelize.Op; 