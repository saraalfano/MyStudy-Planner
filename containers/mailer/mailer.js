const amqp = require('amqplib/callback_api');
const nodemailer = require("nodemailer");

const usermail = "mystudyplanner3@gmail.com";
const passmail = "fpyv ihxn dsoe ducd";

const usernamerabbit = "user";
const passwordrabbit = "password";


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: usermail,
        pass: passmail
    }
});
 

function inviaEmail(destinatario){
    let message = {
        from: 'MyStudyPlanner <sender@example.com>',
        to: '<'+destinatario+'>',
        subject: 'Benvenuto su MyStudyPlanner',
        text: 'Hello to myself!',
        html: '<h1>Benvenuto su MyStudyPlanner</h1><br><p1>MyStudyPlanner è la tua agenda virtuale, programma anche tu il tuo studio.</p1>'
    };

    transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log('Error occurred. ' + err.message);
        }
    
        console.log('Message sent: %s', info.messageId);
    });
}


amqp.connect('amqp://'+usernamerabbit+':'+passwordrabbit+'@rabbit', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'mail';

        channel.assertQueue(queue, {
            durable: true
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, function(msg) {
            try{
                inviaEmail(msg.content.toString());
            }catch(e){
                console.log(e);
            }
            console.log(" [x] Received %s", msg.content.toString());

        }, {
            noAck: true
        });
    });
});