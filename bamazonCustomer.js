var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Tavern07",
  database: "bamazon"
});

connection.connect(function(err) {
  if (err) throw err;
});

connection.query("SELECT * FROM products", function(err, res) {
  if (err) throw err;
  console.table(res);
  askQuestion();
});

var askQuestion = function() {
  inquirer
    .prompt([
      {
        name: "id",
        message: "Which item would you like to buy? (Enter ID)",
        validate: function(num) {
          if (isNaN(num) == false) {
            return true;
          } else {
            return "please enter a number";
          }
        }
      },
      {
        name: "quantity",
        message: "How many of this item do you want?",
        validate: function(num) {
          if (isNaN(num) == false) {
            return true;
          } else {
            return "please enter a number";
          }
        }
      }
    ])
    .then(function(answers) {
      var selectedItem = answers.id;
      var stock = answers.quantity;

      connection.query(
        "SELECT * FROM products WHERE ?",
        {
          id: answers.id
        },
        function(err, res) {
          if (stock > res[0].stock_quantity) {
            console.log("We don't have enough in stock!");
            askQuestion();
          } else {

            var updatedStock = res[0].stock_quantity - stock;
            var charged = res[0].price * stock;

            connection.query(
              "UPDATE products SET ? WHERE ?",
              [
                {
                  stock_quantity: updatedStock
                },
                {
                  id: selectedItem
                }
              ],
              function(err, res) {
                console.log("You have been charged $" + charged);
                askQuestion();
              }
            );
          }
        }
      );
    });
};
