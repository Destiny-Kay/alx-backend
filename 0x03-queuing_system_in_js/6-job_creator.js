import { createQueue } from "kue";

const job_queue = createQueue({name: 'push_notification_code'});
const job = job_queue.create('push_notification_code',{
    phoneNumber: '0222422332',
    message: 'successfull execution'
});

job.on('enqueue',() => {
    console.log('Notification job created:', job.id);
})
.on('complete', () => {
    console.log('Notification job completed');
})
.on('failed attempt', () => {
    console.log('Notification job failed');
})

job.save()
