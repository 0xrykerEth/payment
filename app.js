const express = require('express');
const bodyParser = require('body-parser');
const { Cashfree } = require("cashfree-pg");
const path = require('path')
const payment = require('./payment')
const status = require('./status');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

Cashfree.XClientId = "TEST430329ae80e0f32e41a393d78b923034";
Cashfree.XClientSecret = "TESTaf195616268bd6202eeb3bf8dc458956e7192a85";
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

app.use(status);

app.use(payment);


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname,'index.html'));
});


app.post("/pay", async (req, res) => {
    try {
        const { amount, customer_id, customer_phone } = req.body;
        const orderId = `order_${Date.now()}`;
        const request = {
            order_amount: amount,
            order_currency: "INR",
            order_id: orderId,
            customer_details: { customer_id, customer_phone },
            order_meta: {
                return_url: `https://localhost:3000/status/${orderId}`
            }
        };
        console.log('Reached and redirected to payment page');
        const response = await Cashfree.PGCreateOrder("2023-08-01", request);
        console.log("Cashfree Response:", response.data);

        if (response.data?.payment_session_id) {
            const paymentSessionId = response.data.payment_session_id;
            res.redirect(`/payment?session_id=${paymentSessionId}`);
        } else {
            res.status(400).json({ error: "Failed to create order" });
        }
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message || "Something went wrong" });
    }
});





const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});