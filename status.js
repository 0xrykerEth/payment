const express = require('express');
const { Cashfree } = require("cashfree-pg");
const router = express.Router();

Cashfree.XClientId = "TEST430329ae80e0f32e41a393d78b923034";
Cashfree.XClientSecret = "TESTaf195616268bd6202eeb3bf8dc458956e7192a85";
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

router.post("/status/:orderId", async (req, res) => {
    const { orderId } = req.params;
    console.log(`Fetching payment status for Order ID: ${orderId}`);

    try {
        const response = await Cashfree.PGOrderFetchPayments("2023-08-01", orderId);
        console.log('Order fetched successfully:', response.data);

        if (!Array.isArray(response.data) || response.data.length === 0) {
            return res.send(`<h1>No payments found for Order ${orderId}</h1>`);
        }

        const payment = response.data.find(entry => entry.order_id === orderId);

        if (!payment) {
            return res.send(`<h1>No matching payment found for Order ${orderId}</h1>`);
        }

        let orderStatus = "Failure";
        if (payment.payment_status === "SUCCESS") {
            orderStatus = "Success";
        } else if (payment.payment_status === "PENDING") {
            orderStatus = "Pending";
        }

        res.send(`<h1>Payment ${orderStatus} for Order ${orderId}</h1>`);
    } catch (error) {
        console.error('Error:', error.response?.data?.message || error.message);
        res.status(500).json({ error: "Failed to fetch payment status" });
    }
});

module.exports = router;
