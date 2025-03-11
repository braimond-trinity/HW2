const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'Quietgriffin23',
    database: 'recipedatabase'
});

connection.connect((err => {
    if(err) throw err;
    console.log(`MySQL connection successful!`);
}));

module.exports = connection;
//exports.db_connection = connection;