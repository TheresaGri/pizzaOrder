const express = require("express");
const app = express();
const fs = require("fs").promises;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static("public"));
app.set("view engine", "ejs");

app.get("/api/allergens", async (req, res) => {
  const allergensData = await fs.readFile("./allergens.json");
  let data = JSON.parse(allergensData.toString());
  res.json(data);
});

app.get("/api/allergens/:id", async (req, res) => {
  const allergensData = await fs.readFile("./allergens.json");
  let data = JSON.parse(allergensData.toString());
  let selectedAllergen = data.find(
    (allergen) => allergen.id === parseInt(req.params.id)
  );
  res.json(selectedAllergen);
});

app.get("/api/pizzas", async (req, res) => {
  const pizzaData = await fs.readFile("./pizzas.json");
  let data = JSON.parse(pizzaData.toString());
  res.json(data);
});

app.get("/api/pizzaOrdered", async (req, res) => {
  const pizzaData = await fs.readFile("./pizzaOrdered.json");
  let data = JSON.parse(pizzaData.toString());
  res.json(data);
});

app.get("/api/pizzas/:id", async (req, res) => {
  const pizzaData = await fs.readFile("./pizzas.json");
  let data = JSON.parse(pizzaData.toString());
  let selectedPizza = data.find(
    (pizza) => pizza.id === parseInt(req.params.id)
  );
  //res.send(pizzaComponent(selectedPizza));
  //res.render("index", { text: pizzaComponent(selectedPizza)})

  res.json(selectedPizza);
});

app.get("/api/pizza-search", async (req, res) => {
  const pizzaData = await fs.readFile("./pizzas.json");
  let data = JSON.parse(pizzaData.toString());
  const allergensData = await fs.readFile("./allergens.json");
  let allergenData = JSON.parse(allergensData.toString());

  if (req.query.name !== undefined) {
    data = data.filter((pizza) => pizza.name.toLowerCase() === req.query.name);
  }

  if (req.query.avoid !== undefined) {
    let allergyNumber = req.query.avoid;
    data = data.filter(
      (pizza) => !pizza.allergens.includes(parseInt(allergyNumber))
    );
  }

  if (req.query["max-price"] !== undefined) {
    data = data.filter((pizza) => pizza.price <= parseInt(req.query["max-price"]));
  }

  if (req.query.avoidAllergyByName !== undefined) {
    allergenData = allergenData.find(
      (allergen) => allergen.name === req.query.avoidAllergyByName
    );
    data = data.filter(
      (pizza) => !pizza.allergens.includes(parseInt(allergenData.id))
    );
  }
  res.json(data);
});

app.get("/api/order", async (req, res) => {
  const ordersData = await fs.readFile("./orders.json");
  let data = JSON.parse(ordersData.toString());
  res.json(data);
});

app.get("/order/new", async (req, res) => {
  const ordersData = await fs.readFile("./orders.json");
  let data = JSON.parse(ordersData.toString());
  let latestOrder = data.slice(-1);
  res.json(latestOrder);
});

app.get("/api/order/:id", async (req, res) => {
  const ordersData = await fs.readFile("./orders.json");
  let data = JSON.parse(ordersData.toString());
  data = data.filter((order) => order.id === parseInt(req.params.id));
  res.json(data);
});

app.get("/pizza/list", async (req, res) => {
  const pizzaData = await fs.readFile("./pizzas.json");
  let dataOfPizzas = JSON.parse(pizzaData.toString());
  //have to implement to display names of allergens
  const allergenData = await fs.readFile("./allergens.json");
  let dataOfAllergens = JSON.parse(allergenData.toString());

  for (let i = 0; i < dataOfPizzas.length; i++) {
    for (let j = 0; j < dataOfPizzas[i].allergens.length; j++) {
      for (let k = 0; k < dataOfAllergens.length; k++) {
        if (dataOfPizzas[i].allergens[j] === dataOfAllergens[k].id) {
          dataOfPizzas[i].allergens[j] = dataOfAllergens[k].name;
        }
      }
    }
  }
  const pizzaHTML = [];
  for (pizza of dataOfPizzas) {
    pizzaHTML.push(pizzaComponent(pizza));
  }

  res.render("index", { text: pizzaHTML.join("") });

  //res.json(dataOfPizzas);
});

app.post("/api/order", async (req, res) => {
  const ordersData = await fs.readFile("./orders.json");
  let data = JSON.parse(ordersData.toString());
  const newOrder = req.body;
  if (newOrder.id === undefined) {
    //get highest id
    let highestIdOfOrders = data.map((order) => order.id);
    highestIdOfOrders = Math.max(...highestIdOfOrders);
    newOrder.id = highestIdOfOrders + 1;
  }
  data.push(newOrder);
  
  await fs.writeFile("./orders.json", JSON.stringify(data));
  res.send(data);
});

app.put("/api/order/:id", async (req, res) => {
  const ordersData = await fs.readFile("./orders.json");
  let data = JSON.parse(ordersData.toString());
  let updateOrder = data.filter(
    (order) => order.id === parseInt(req.params.id)
  );
  updateOrder = req.body;
  await fs.writeFile("./orders.json", JSON.stringify(updateOrder));
  res.send(updateOrder);
});

app.delete("/api/order/:id", async (req, res) => {
  const ordersData = await fs.readFile("./orders.json");
  let data = JSON.parse(ordersData.toString());
  const notDeletedOrders = data.filter(
    (order) => order.id !== parseInt(req.params.id)
  );
  await fs.writeFile("./orders.json", JSON.stringify(notDeletedOrders));
  res.send(notDeletedOrders);
});

app.listen(3000);

const listComponent = (list) => list.map((tag) => `<li>${tag}</li>`);
/*const pizzaComponent = ({id, name, ingredients, price, allergens}) => `
    <div class="pizza" id="${id}">
        <div class="details"><h2 class="moreDetails">Number: </h2><h2>#${id}</h2></div>
        <div class="details"><h2 class="moreDetails">Pizza: </h2><h2>${name}</h2></div>
        <div class="details"><h2 class="moreDetails">Ingredients: </h2><ul>${listComponent(ingredients).join("")}</ul></div>
        <div class="details"><h2 class="moreDetails">Allergens: </h2><ul>${listComponent(allergens).join("")}</ul></div>
        <div class="details"><h2 class="moreDetails">Price: </h2><h2>${price}€</h2></div>
        <div class="details"><input type="text" class="moreDetails" id="inputAmount" placeholder="Amount"><button  class="moreDetails" id="addButton">Add to order</button></div>
    </div>
`;*/
const pizzaComponent = ({ id, name, ingredients, price, allergens }) => `
    <div class="pizza" id="${id}">
        <div class="details"><h2 class="moreDetails">#${id}</h2><h1>${name}</h1></div>
        <div class="detailsList"><h2 class="moreDetails">Ingredients: </h2><ul>${listComponent(
          ingredients
        ).join("")}</ul></div>
        <div class="detailsList"><h2 class="moreDetails">Allergens: </h2><ul>${listComponent(
          allergens
        ).join("")}</ul></div>
        <div class="details"><h2 class="moreDetails">Price: </h2><h2>${price}€</h2></div>
        <div class="details">
          <input type="text" class="moreDetails" id="inputAmount${id}" placeholder="Amount">
          <button  class="addButton" id="addButton${id}">Add to order</button>
        </div>
    </div>
`;

const formComponent = `<form id = "form">
    <label for="fname">Name:</label><br>
    <input type="text" id="fname" name="fname"><br>
    <label for="emailAdress">email:</label><br>
    <input type="text" id="emailAdress" name="emailAdress"><br>
    <label for="city">city:</label><br>
    <input type="text" id="city" name="city"><br>
    <label for="street">street:</label><br>
    <input type="text" id="street" name="street"><br>
    <button type = "submit" id = "submitButton">Submit</button>
  </form>`;