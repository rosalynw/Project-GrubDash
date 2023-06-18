const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function list(req, res) {
  res.json({data: orders})
}

function orderBodyExists (req, res, next) {
  const {data: { deliverTo, mobileNumber, dishes} = {} } = req.body;
  //check if properties exist
  if (!deliverTo || !mobileNumber || !dishes) {
      return res.status(400).json({ error: `deliverTo, mobileNumber, status, and dishes property missing`})
  }
    if (!Array.isArray(dishes) || dishes.length === 0) {
    return res.status(400).json({ error: "Order must include at least one dish" });
  }
  
    for (let i = 0; i < dishes.length; i++) {
    const { quantity } = dishes[i];

    // Check if quantity property exists and is a positive integer
    if (!quantity || !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({ error: `Dish ${i} must have a quantity that is an integer greater than 0` });
    }
  }
  return next()
}

//create orders
function create(req, res) {
  const {data: { deliverTo, mobileNumber, status, dishes} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes
  }
  orders.push(newOrder);
  //console.log(newOrder)
  res.status(201).json({ data: newOrder })
}

function orderExists(req,res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find(order => order.id === orderId);
  if(foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  return res.status(404).json({ error: `Order id not found: ${orderId}`})
}

function destroy (req, res) {
  const { orderId } = req.params;
  const order = res.locals.order;
  
    if (order.status !== "pending") {
      //console.log(order)
    return res.status(400).json({ error: "An order cannot be deleted unless it is pending." });
  }
  
  const index = orders.findIndex((order) => order.id === orderId);
  if(index > -1) {
    orders.splice(index, 1);
  }
  res.sendStatus(204);
}

function read (req, res) {
  const {orderId} = req.params;
  res.json({data: res.locals.order})
}

function update(req, res) {
  const order = res.locals.order;
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  
  if (id && (id) !== order.id) {
    res.status(400)
    .json({ error: `Order id does not match route id. Order ${id}, Route; ${order.id}`});
  }
  
  if (status === 'delivered') {
    res.status(400)
    .json({ error: `A delivered order cannot be changed`})
  }
  if (    
    status !== "pending" &&
    status !== "preparing" &&
    status !== "out-for-delivery" &&
    status !== "delivered" 
  ) {
    return res
      .status(400)
      .json({
        error:
          "Order must have a status of pending, preparing, out-for-delivery, delivered",
      });
  }
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;
    res.json({data: order})
  
  }

module.exports = {
  list,
  read: [orderExists, read],
  create: [orderBodyExists,create],
  update: [orderExists, orderBodyExists, update],
  delete: [orderExists, destroy]
}