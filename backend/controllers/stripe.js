const prisma = require('../config/prisma');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


exports.payment = async (req, res) => {
    try {
        
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 1099,
        currency: 'thb',
        automatic_payment_methods: {enabled: true},
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
        res.status(500).json({ message: "server error" });
    }
}