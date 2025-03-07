import Queue from 'bull';

const connectionX = process.env.REDIS_URI || "";
const messageQueueSent = new Queue('messageQueueSent', connectionX);
console.log(messageQueueSent);
export default messageQueueSent;