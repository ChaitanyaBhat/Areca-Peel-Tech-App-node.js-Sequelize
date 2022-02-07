const Sequelize = require("sequelize");

//making connection to msql db
const sequelize = new Sequelize("ArecapeeltechDb", "root", "cane1.Physics", {
                    host: "localhost",
                    dialect: "mysql",       
                    define: {
                        freezeTableName: true       //stops auto-pluralizing table names
                    }
                });
         
//checking the connection
try {
    sequelize.authenticate();     
    console.log("Connection has been established successfully.");
}
catch(err) {
    console.log("Unable to connect to the database. Error in connection instance.");
    alert("Unable to connect to the database. Error in connection instance.");
}

module.exports = { sequelize };
