import createPushNotificationsJobs from './8-job';
import { createQueue } from 'kue';
import { expect } from 'chai';
import sinon from 'sinon';

describe('createPushNotificationsJobs', () =>{
    const SINONINST = sinon.spy(console);
    const queue = createQueue({ name: 'push_notification_code_test' });
  
    before(() => {
        queue.testMode.enter(true);
    });
  
    after(() => {
        queue.testMode.clear();
        queue.testMode.exit();
    });
  
    afterEach(() => {
        SINONINST.log.resetHistory();
    });
  
    it('displays an error message if jobs is not an array', () => {
      expect(
        createPushNotificationsJobs.bind(createPushNotificationsJobs, {}, queue)
      ).to.throw('Jobs is not an array');
    });
  
    it('adds jobs to the queue with the correct type', (done) => {
      expect(queue.testMode.jobs.length).to.equal(0);
      const jobInfos = [
        {
          phoneNumber: '44556677889',
          message: 'Use the code 1982 to verify your account',
        },
        {
          phoneNumber: '98877665544',
          message: 'Use the code 1738 to verify your account',
        },
      ];
      createPushNotificationsJobs(jobInfos, queue);
      expect(queue.testMode.jobs.length).to.equal(2);
      expect(queue.testMode.jobs[0].data).to.deep.equal(jobInfos[0]);
      expect(queue.testMode.jobs[0].type).to.equal('push_notification_code_3');
      queue.process('push_notification_code_3', () => {
        expect(
            SINONINST.log
            .calledWith('Notification job created:', queue.testMode.jobs[0].id)
        ).to.be.true;
        done();
      });
    });
  
    it('registers the progress event handler for a job', (done) => {
        queue.testMode.jobs[0].addListener('progress', () => {
        expect(
            SINONINST.log
            .calledWith('Notification job', queue.testMode.jobs[0].id, '25% complete')
        ).to.be.true;
        done();
      });
      queue.testMode.jobs[0].emit('progress', 25);
    });
  
    it('registers the failed event handler for a job', (done) => {
        queue.testMode.jobs[0].addListener('failed', () => {
        expect(
            SINONINST.log
            .calledWith('Notification job', queue.testMode.jobs[0].id, 'failed:', 'Failed to send')
        ).to.be.true;
        done();
      });
      queue.testMode.jobs[0].emit('failed', new Error('Failed to send'));
    });
  
    it('registers the complete event handler for a job', (done) => {
        queue.testMode.jobs[0].addListener('complete', () => {
        expect(
            SINONINST.log
            .calledWith('Notification job', queue.testMode.jobs[0].id, 'completed')
        ).to.be.true;
        done();
      });
      queue.testMode.jobs[0].emit('complete');
    });
});
