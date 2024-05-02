var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "BaoQuanHan",
    password: "Baoquan12345",
    database: "frontend_hieu"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
module.exports = con;