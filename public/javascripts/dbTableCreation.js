const { sequelize } = require("./dbConnection.js");

//importing default datatypes
const { DataTypes } = require("sequelize");

//creating models and tables
const Customer = sequelize.define("Customer", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.STRING,
        defaultValue: ""
    },
    contact_no: {
        type: DataTypes.STRING(11),
        defaultValue: ""
    }
},
    {
        tableName: "Customers"
});

const ReceivedGoods = sequelize.define("ReceivedGoods", {
    received_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Customer,
            key: "id"
        }
    },
    sacks_received: {
        type: DataTypes.DOUBLE,
        defaultValue: 0
    },
    received_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "Not Returned"
    }
}, {
    tableName: "ReceivedGoods"
});

const ReturnedGoods = sequelize.define("ReturnedGoods", {
    received_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: ReceivedGoods,
            key: "received_id"
        }
    },
    returned_date: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW
    },
    peeled_arecanuts: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    price_per_kg: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    gst_rate: {
        type: DataTypes.DOUBLE,
        allowNull: false
    }
}, {
    tableName: "ReturnedGoods"
});

(async () => {
    // await sequelize.sync({force:true});         //drops all tables & creates new
    await sequelize.sync();                     //creates new tables if not exist  
})()

module.exports = { Customer, ReceivedGoods, ReturnedGoods };
