var mysql = require('mysql');
var con = mysql.createConnection({
    host: "localhost",
    user: "BaoQuanHan",
    password: "HoaiAn260198",
    database: "sosomienbac"
});

con.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});
module.exports = con;