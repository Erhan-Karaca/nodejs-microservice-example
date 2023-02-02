require('dotenv').config()

const Broker = require('./services/rabbitMQ')
const RMQConsumer = new Broker().init();

const sendMailHandler = async (msg, ack) => {
    let mail_address = msg.content.toString();
    let content = `${mail_address} mail gönderildi`
    console.log("Log: ", content)
    ack();
}

async function connectMailConsumer() {
    try {
        const consumer = await RMQConsumer;
        await consumer.createEx({
            name: process.env.RMQ_EXCHANGE_NOTIFICATION,
            type: process.env.RMQ_EXCHANGE_TYPE,
        });
        await consumer.subscribe({exchange: process.env.RMQ_EXCHANGE_NOTIFICATION, routingKey: process.env.RMQ_QUEUE_MAIL}, sendMailHandler);
    } catch (error) {
        console.log(error);
    }
}

connectMailConsumer();