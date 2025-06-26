const nodemailer = require('nodemailer');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS  
    }
});

/**
 * Sends an email notification about a price drop.
 * @param {string} recipientEmail The email address of the user to notify.
 * @param {string} productName The name of the product.
 * @param {number} newPrice The new price of the product.
 * @param {string} productUrl The URL of the product.
 */
const sendPriceDropEmail = async (recipientEmail, productName, newPrice, productUrl) => {
    const mailOptions = {
        from: process.env.EMAIL_USER, // Sender address
        to: recipientEmail, // List of recipients
        subject: `Price Drop Alert: ${productName} is now $${newPrice}!`, // Subject line
        html: `
            <p>Hello,</p>
            <p>Great news! The price for <b>${productName}</b> has dropped to <b>$${newPrice}</b>.</p>
            <p>Don't miss out! Check it out here: <a href="${productUrl}">${productUrl}</a></p>
            <br>
            <p>Happy tracking!</p>
            <p>Your Market Watcher Team</p>
        ` // HTML body
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${recipientEmail} for price drop on ${productName}`);
    } catch (error) {
        console.error(`Error sending email to ${recipientEmail} for ${productName}:`, error.message);
    }
};

module.exports = { sendPriceDropEmail };