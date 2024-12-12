const amqp = require("amqplib");
const dotenv = require("dotenv");
dotenv.config();
const RABBITMQ_URL = process.env.RABBIT_URL;

let connection, channel;

async function connect() {
  try {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log("Connected to RabbitMQ");
  } catch (error) {
    console.log(error);
  }
}

async function subscribeToQueue(queueName, callback) {
  if (!channel) {
    await channel;
  }
  channel.consume(queueName, (message) => {
    callback(message.content.toString());
    channel.ack(message);
  });
}

async function publishToQueue(queueName, message) {
  if (!channel) {
    await connect();
  }
  await channel.assertQueue(queueName);
  channel.sendToQueue(queueName, Buffer.from(message));
}

module.exports = { connect, subscribeToQueue, publishToQueue };
