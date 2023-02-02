require('dotenv').config();

const Broker = require('./services/rabbitMQ')
const RMQConsumer = new Broker().init();

async function connect_rabbitmq() {
    try {
        const consumer = await RMQConsumer;
        await consumer.createEx({
            name: process.env.RMQ_EXCHANGE_NOTIFICATION,
            type: process.env.RMQ_EXCHANGE_TYPE,
        });
        for (let i = 1; i < 2000; i++) {
            let email = {To:`erhan${i}@mail.com`, Subject:"Test Mesaj Node", Html:"", Message: "Message Node Test Email"}
            console.log("Kayıt olan mail adresi: ", email);
            await consumer.publish({exchange: process.env.RMQ_EXCHANGE_NOTIFICATION, routingKey: process.env.RMQ_QUEUE_MAIL}, email);
            await consumer.publish({exchange: process.env.RMQ_EXCHANGE_NOTIFICATION, routingKey: process.env.RMQ_QUEUE_SMS}, email);
        }
    } catch (error) {
        console.log(error);
    }
}

connect_rabbitmq()