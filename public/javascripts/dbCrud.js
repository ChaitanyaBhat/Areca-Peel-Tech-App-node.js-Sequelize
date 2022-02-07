const { Sequelize } = require("sequelize");
const { sequelize } = require("./dbConnection.js");
const { Customer, ReceivedGoods, ReturnedGoods } = require("./dbTableCreation.js");

async function receivedGoodsData(req,callback) {
    let customer_name = req.body.customer_name;
    let address = req.body.address;
    let contact_no = req.body.contact_no;
    let sacks_received = req.body.sacks_received;
    let received_date = req.body.received_date;
    // console.log(customer_name, address, contact_no, sacks_received,typeof(received_date) ,received_date);
    
    let customer_details, received_details; 
    
    //using transactions to rollback in case of error in one of the creations
    try {
            [customer_details, received_details] = await sequelize.transaction(async (t) => {
                if(contact_no.length == 0) {
                    customer_details = await Customer.create(
                        { 
                            name: customer_name,
                            address: address,
                        }, { transaction: t }
                    );   
                }
                else if((contact_no.length > 9) && (! isNaN(contact_no))) {
                    customer_details = await Customer.create(
                        { 
                            name: customer_name,
                            address: address,
                            contact_no: contact_no
                        }, { transaction: t }
                    );   
                } 
                else throw new Error("Wrong input for 'Contact Number' feild");   
    
                if(sacks_received == "" && received_date == "") {
                    received_details = await ReceivedGoods.create(
                        {
                            customer_id: customer_details.id,
                        }, { transaction: t }
                    );  
                }
                else if(sacks_received == "") {
                    received_details = await ReceivedGoods.create(
                        {
                            customer_id: customer_details.id,
                            received_date: received_date
                        }, { transaction: t }
                    );  
                }
                else if(received_date == "") {
                    received_details = await ReceivedGoods.create(
                        {
                            customer_id: customer_details.id,
                            sacks_received: sacks_received,
                        }, { transaction: t }
                    );   
                }
                else {
                    received_details = await ReceivedGoods.create(
                        {
                            customer_id: customer_details.id,
                            sacks_received: sacks_received,
                            received_date: received_date
                        }, { transaction: t }
                    );  
                }  
                
                return [customer_details, received_details];
            });        
    }
    catch(err) {
        // console.log(err);
        customer_details = "Error";
        received_details = "Apropriate informations are needed to store the data.";
    }
         
    customer_details = JSON.stringify(customer_details);
    received_details = JSON.stringify(received_details);

    return callback(customer_details, received_details);
}

async function transactionDetails(page_no, callback) {
    // console.log("page no.-----------------",page_no);

    //establishing relationships between models
    Customer.hasOne(ReceivedGoods, {foreignKey: "id"});
    ReceivedGoods.belongsTo(Customer, {foreignKey: "customer_id"});
    
    ReceivedGoods.hasOne(ReturnedGoods, {foreignKey: "received_id"});
    ReturnedGoods.belongsTo(ReceivedGoods, {foreignKey: "received_id"});

    let transaction_data;
    try {
        transaction_data = await ReceivedGoods.findAndCountAll(
            {
                attributes:["received_id", "customer_id", "sacks_received", "status", 
                        [sequelize.fn("date_format", sequelize.col("received_date"), "%d/%m/%y"), "received_date"]
                        ],
                include: [
                    {
                        model: Customer, 
                        attributes: ["id", "name", "address", "contact_no"]
                    },
                    {
                        model: ReturnedGoods,
                        attributes: ["received_id", "peeled_arecanuts", "price_per_kg", "gst_rate",
                            [sequelize.fn("date_format", sequelize.col("returned_date"), "%d/%m/%y"), "returned_date"],
                            [Sequelize.literal("(peeled_arecanuts * price_per_kg)"), "subtotal"],
                            [Sequelize.literal("((gst_rate / 100) * (peeled_arecanuts * price_per_kg))"), "gst_applicable"],
                            [Sequelize.literal("((peeled_arecanuts * price_per_kg) + ((gst_rate / 100) * (peeled_arecanuts * price_per_kg)))"), "total_amount"]
                        ]
                    }
                ],
                order: [["customer_id", "DESC"]],
                limit: 7,                          //number of rows per page
                offset: (7*page_no)                //row number from which the next page displays
            }
        );
    } catch(err) {
        // console.log(err);
        transaction_data = "Error"; 
    }

    transaction_data = JSON.stringify(transaction_data,null,2);

    return callback(transaction_data);
}

async function uploadReturnedGoods(req, callback) {
    let received_id = req.body.received_id;
    let customer_name = req.body.name;
    // console.log("received_id, customer_name", received_id, customer_name);
    return callback(received_id, customer_name);
}

async function returnedGoodsData(req, callback) {
    let received_id = req.body.received_id;
    let name = req.body.name;
    let returned_date = req.body.returned_date;
    let areca_weight = req.body.areca_weight;
    let kg_price = req.body.kg_price;
    let gst_rate = req.body.gst_rate;
    // console.log("name, received_id, returned_date,",name, received_id, returned_date, areca_weight, kg_price, gst_rate);
    
    let returned_details, affected_rows;
    try {
        [returned_details, affected_rows] = await sequelize.transaction(async (t) => {
            //insert data into ReturnedGoods table
            if(returned_date == "") {
                returned_details = await ReturnedGoods.create(
                    {
                        received_id: received_id,
                        peeled_arecanuts: areca_weight,
                        price_per_kg: kg_price,
                        gst_rate: gst_rate
                    }, { transaction: t }
                );
            }
            else {
                returned_details = await ReturnedGoods.create(
                    {
                        received_id: received_id,
                        returned_date: returned_date,
                        peeled_arecanuts: areca_weight,
                        price_per_kg: kg_price,
                        gst_rate: gst_rate
                    }, { transaction: t }
                );
            }

            //update status in ReceivedGoods table
            affected_rows = await ReceivedGoods.update(
                { 
                    status: "Returned"
                }, 
                {
                    where: { received_id: received_id }, 
                    returning: true, 
                    plain: true,
                    transaction: t 
                }
            );

            return [returned_details, affected_rows];
        });
    } catch(err) {
        // console.log(err);
        returned_details = "Error";
        affected_rows = {id: received_id, customer_name: name};
    }
    
    returned_details = JSON.stringify(returned_details);

    return callback(returned_details, affected_rows);
}

function customerDetails(req, callback) {
    let customer_data = {
        received_id: req.body.received_id,
        customer_id: req.body.customer_id,
        sacks_received: req.body.sacks_received,
        received_date: req.body.received_date,
        status: req.body.status,
        id: req.body.id,
        name: req.body.name,
        address: req.body.address,
        contact_no: req.body.contact_no,
        returned_id: req.body.returned_id,
        returned_date: req.body.returned_date,
        peeled_arecanuts: req.body.peeled_arecanuts,
        price_per_kg: req.body.price_per_kg,
        gst_rate: req.body.gst_rate,
        subtotal: req.body.subtotal,
        gst_applicable: req.body.gst_applicable,
        total_amount: req.body.total_amount
    }
    // console.log("customer_data",customer_data);
    return callback(customer_data);
}


module.exports = { receivedGoodsData, transactionDetails, uploadReturnedGoods, returnedGoodsData, customerDetails };
