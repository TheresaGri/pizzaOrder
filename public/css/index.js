const menuButton = document.querySelector("#menuButton");
const allergensButton = document.querySelector("#allergensButton");
const myOrderButton = document.querySelector("#myOrderButton");
const addButtons = document.querySelector(".addButton");
const body = document.querySelector("body");
const pizzas = document.querySelectorAll(".pizza");
document.querySelector("#formDiv").style.display = "none";

const pizzasOrdered = [];
for (let i = 1; i <= pizzas.length; i++) {
  const input = document.getElementById(`inputAmount${i}`);
  input.addEventListener("input", () => {
    if (input.value !== "") {
      const addButton = document.getElementById(`addButton${i}`);
      addButton.addEventListener("click", () => {
        document.querySelector("#formDiv").style.display = "block";
        pizzasOrdered.push({ id: i, amount: parseInt(input.value) });
        console.log(pizzasOrdered);
      });
    }
  });
}

menuButton.addEventListener("click", () => {
  location.assign("http://localhost:3000/api/pizzas/");
});

allergensButton.addEventListener("click", () => {
  location.assign("http://localhost:3000/api/allergens/");
});

myOrderButton.addEventListener("click", () => {
  location.assign("http://localhost:3000/order/new");
});

const form = document.querySelector("form");
const date = new Date();
console.log(date.getMinutes());

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const value = Object.fromEntries(data.entries());
  const date = new Date();

  let dataOfOrder = {
    pizzas: pizzasOrdered,
    date: {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hours: date.getHours(),
      minutes: date.getMinutes(),
    },
    customer: {
      name: value.fname,
      email: value.emailAdress,
      adress: { city: value.city, street: value.street },
    },
  };

  res = fetch("http://localhost:3000/api/order", {
    method: "POST",
    body: JSON.stringify(dataOfOrder),
    headers: { "Content-Type": "application/json" },
  });
});
