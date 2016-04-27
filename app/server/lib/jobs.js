import { Meteor } from 'meteor/meteor';
import { repoJobs, Repos, Searchs } from '../../lib/collections';

/* eslint-disable no-console */
const updateStatus = ({ name, url }, status) => {
  console.log(`${status}: ${name}`);
  Repos.update(
    { name, url },
    { $set: { status } }
  );
};

const getJob = message => {
  const { params = [] } = message;
  const [_id] = params;
  const job = repoJobs.findOne({ _id });
  return job || {};
};

export default () => {
  Meteor.testClone = () => {
    Meteor.call('repos.add', {
      name: 'xcv58/startup-tools',
      url: 'https://github.com/xcv58/startup-tools',
    }, { force: true });
  };

  Meteor.cloneAll = () => {
    const cursor = Searchs.find();
    for (const search of cursor.fetch()) {
      for (const item of search.items) {
        const { repository: { full_name: name, html_url: url } } = item;
        Meteor.call('repos.add', { name, url });
      }
    }
  };

  Meteor.cleanAll = () => {
    Repos.remove({});
    repoJobs.remove({});
  };


  repoJobs.events.on('jobDone', message => {
    const job = getJob(message);
    updateStatus(job.data, 'done');
  });

  repoJobs.events.on('jobFail', message => {
    const job = getJob(message);
    updateStatus(job.data, 'fail');
  });
};
