var inquirer = require('inquirer');
var mysql = require('mysql');
require('console.table')
var currentID = null;
var currentQty = null;

var questions = [
    {
    type: 'input',
    name: 'id',
    message: 'Enter a product ID:',
    validate: function (value) {
    
    return new Promise(
        function(resolve, reject) {
            connection.query('SELECT * FROM products WHERE item_id='+value, function(error, results, fields) {
                if (error) console.error(error);
                if (results.length > 0) {
                    currentID = results[0].item_id;
                    resolve(true);
                }
                reject("That id is not in our database. Please enter another");
            });
        }
    );      
    
    }
  },
  {
    type: 'input',
    name: 'id',
    message: 'How many would you like to buy?',
    validate: function (value) {
    return new Promise(
        function(resolve, reject) {
            connection.query('SELECT * FROM products WHERE item_id='+currentID, function(error, results, fields) {
                if (error) console.error(error);
                if (results[0].stock_quantity >= parseInt(value)) {
                    currentQty = parseInt(value)
                    resolve(true);
                }
                reject("Insufficient quantity in stock! There are only " + results[0].stock_quantity + " left.");
            });
        }
    );      
    
    }
  }
]

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'Bamazon'
});

connection.connect();

connection.query('SELECT * FROM products', function(error, results, fields) {
    if (error) console.error(error);
    var results_table = [];
    results.forEach((r) => {
        results_table.push(
            {
                id: r.item_id,
                name: r.product_name,
                price: r.price
            }
        )
    });
    console.table(results_table);

    inquirer.prompt(questions).then(function(answers) {
        
        connection.query('SELECT stock_quantity, price FROM products WHERE item_id='+currentID, function(error, results, fields) {
            if (error) console.error(error);
            var new_item_qty = results[0].stock_quantity - currentQty;
            var price = results[0].price
            connection.query('UPDATE products SET stock_quantity='+new_item_qty+' WHERE item_id='+currentID, function() {
                console.log("Your total is $" + (price*currentQty) + ". Enjoy your product(s)!! Thank you for shopping!");
            });
            connection.end();
        });
        
    });

})

