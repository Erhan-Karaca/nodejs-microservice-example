require('dotenv').config()
const amqp = require('amqplib')
const _ = require('lodash')
class MessageBroker {
    constructor() {
        this.queues = {}
    }

    async init () {
        const connOptions = {credentials: amqp.credentials.plain(process.env.AMQP_USER, process.env.AMQP_PASS)};
        this.connection = await amqp.connect(process.env.AMQP_HOST || 'amqp://localhost', connOptions)
        this.channel = await this.connection.createChannel()
        return this
    }

    async createEx ({name, type, durable = false}) {
        if (!this.connection) await this.init()
        await this.channel.assertExchange(name, type, {durable})
        this.exchange = name
        return this
    }

    async publish ({exchange, routingKey}, msg) {
        const queue = `${exchange}.${routingKey}`;
        routingKey = queue
        await this.channel.assertQueue(queue, { durable: false })
        this.channel.bindQueue(queue, exchange, routingKey)
        this.channel.publish(exchange, routingKey, Buffer.from(msg))
    }

    async subscribe ({exchange, routingKey}, handler) {
        const queue = `${exchange}.${routingKey}`
        routingKey = queue
        if (!this.connection) {
            await this.init()
        }

        if (this.queues[queue]) {
            const existingHandler =  this.queues[queue].find(h => h === handler)
            if (existingHandler) {
                return () => this.unsubscribe(queue, existingHandler);
            }
            this.queues[queue].push(handler)
            return () => this.unsubscribe(queue, handler);
        }

        await this.channel.assertQueue(queue, {durable: false})
        this.channel.bindQueue(queue, exchange, routingKey)
        this.queues[queue] = [handler]
        this.channel.consume(queue, async (msg) => {
            const ack = _.once(() => this.channel.ack(msg))
            this.queues[queue].forEach(h => h(msg, ack))
        })
        return () => this.unsubscribe(queue, handler)
    }

    async unsubscribe (queue, handler) {
        _.pull(this.queues[queue], handler)
    }
}

module.exports = MessageBroker