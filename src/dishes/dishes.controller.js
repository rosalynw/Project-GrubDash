const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function dishBodyExists (req, res, next) {
    const {data: { name, description, price, image_url} = {} } = req.body;
    if (name && description && price && image_url && price > 0) {
        return next();
    }
    return res.status(400).json({error: `name, description, price, and image_url property required`})
}

function list(req, res) {
  res.json({data: dishes})
}
function create (req, res) {
    const {data: {name, description, price, image_url} } = req.body;
    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url
    }
    dishes.push(newDish);
    //console.log(newDish);
    res.status(201).json({ data: newDish })
}

function dishExists (req,res, next) {
    const {dishId} = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
  //console.log(foundDish)
  
    if (foundDish) {
        res.locals.dish = foundDish;
        return next();
    }
    next({
        status: 404,
        message: `Dish id not found ${dishId}`
    })
}

function read(req, res) {
  const { dishId } = req.params;
  res.json({ data: res.locals.dish })
}

//update dish properties by id
function update(req,res) {
  
  const dish = res.locals.dish;
  const { data: { id,name, description, price, image_url } = {} } = req.body;
  
    if (id && (id) !== dish.id) {
      //console.log(id)
      //console.log(dish.id)
    return res
      .status(400)
      .json({ error: `Dish id does not match route parameter: ${id}` });
  }
  
  if (price && !Number.isInteger(price)) {
    return res.status(400).json({ error: `price must be number`})
  }
  
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;
  res.json({data: dish})
}

module.exports = {
  list,
  create: [dishBodyExists,create],
  read: [dishExists, read],
  update: [dishExists, dishBodyExists, update]
}