var express = require("express");
var app = express();

//to parse jason
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//to use session
var session = require("express-session");
app.use(session({secret:"pranava shree", saveUninitialized:true, resave:true}));

//set view engin as ejs
app.set("view engine", "ejs");

//specifying path that all static files are in "public" folder
app.use(express.static("public"));

//custom middleware for authenticaion before accessing "/options/..." urls
var authenticate = function(req, res, next) {
    if(req.session.user_name && req.session.password) {
        next();
    }
    else {
        return res.status(401).send("You are not logged in!");
    }
}

//specifying authenticate() middleware to use before every "/options/..." url
app.use("/options", authenticate);

const { receivedGoodsData, transactionDetails, uploadReturnedGoods, returnedGoodsData, customerDetails } = require("../public/javascripts/dbCrud.js");

app.get("/", function(req, res) {
    res.render("index");
});

app.get("/home", function(req, res) {
    res.render("index");
});
app.get("/options", function(req, res) {
    res.render("options");
});

//sets user_name & password fields value from adminLogin.ejs file request
app.post("/login", function(req, res) {
    req.session.user_name = req.body.user_name;
    req.session.password = req.body.password;
    res.redirect("/login");
});

app.get("/login", function(req, res) {
    if(req.session.user_name && req.session.password) {
        return res.redirect("/options");
    }
    res.render("adminLogin");
});

app.get("/logout", function(req, res) {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        // console.log("req.session", req.session);
        res.redirect("/");
    });
});

app.get("/options/received", function(req, res) {
    res.render("received", {label_text: ""});
});

app.post("/received", function(req, res) {
    receivedGoodsData(req, function(customer_details_json, received_details_json) {
        // console.log("customer_details_json",customer_details_json);
        let customer_details = JSON.parse(customer_details_json);
        let received_details = JSON.parse(received_details_json);
        // console.log("customerDetails","receivedDetails",customer_details,received_details);
        let label_text = "";
        if(customer_details == "Error") {
            label_text = "Proper inputs required!"
            return res.render("received", {label_text: label_text});
        }
        res.redirect("/options/transactions/0");
    });
});

app.get("/options/transactions/:pageNo", function(req, res) {
    if(req.params.pageNo < 0) {
        return res.status(401).send("No more data to show! Please go back to previous page.")
    }
    // console.log("req.param,req.params",req.params, req.params.pageNo);
    transactionDetails(req.params.pageNo, function(transaction_json) {
    let data_count_rows = JSON.parse(transaction_json);
    
    let label_text = "";
    if(data_count_rows == "Error") {
        label_text = "Not able to get the required data!"
        return res.end();
    }

    let transaction_data = data_count_rows.rows;
    let data_count = data_count_rows.count;
    
    if(!data_count || (transaction_data.length == 0)) {
        label_text = "No more data to show!";
    }
    
    // console.log("data_count",data_count);
    // console.log("customers_data1", transaction_data);
    
    for( var key in transaction_data ) {
        if( transaction_data[key].ReturnedGood == null ) {
            transaction_data[key].ReturnedGood = { id: 0, returned_date: "", peeled_arecanuts: "", 
                                                price_per_kg: "", gst_rate: "", subtotal: "",
                                                gst_applicable: "", total_amount: "" }
            transaction_data[key].button_text = "Upload";
        }
        else transaction_data[key].button_text = "Invoice";
    }
    // console.log("customers_data2", transaction_data);
    res.render("transactions", {data: transaction_data, page_no: req.params.pageNo, no_data_label: label_text});
    });
});

app.post("/upload", function(req, res) {
    uploadReturnedGoods(req, function(id, name) {
        res.render("returned", {data: id, customer_name: name, label_text: ""});
    });
});

app.post("/returned", function(req, res) {
    returnedGoodsData(req, function(returned_json, affected_rows) {
        let returned_details = JSON.parse(returned_json);

        // console.log("returned_details",returned_details, affected_rows);
        let label_text = "";
        if(returned_details == "Error") {
            label_text = "Proper inputs required!"
            return res.render("returned", {data: affected_rows.id, customer_name: affected_rows.customer_name, label_text: label_text});
        }
        res.redirect("/options/transactions/0");
    });
});

app.post("/details", function(req, res) {
    customerDetails(req, function(customer_data) {
        // console.log("customer_data",customer_data);
        res.render("printInvoice", {details: customer_data});
    });
});

app.listen(5000, function() {
    console.log("Listenig to port 5000")
});
