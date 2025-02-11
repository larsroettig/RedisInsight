const fs = require('fs');

const file = 'tests/e2e/results/e2e.results.json'
const results = {
  message: {
    text: `*E2ETest - All* (Branch: *${process.env.CIRCLE_BRANCH}*)` +
      `\n<https://app.circleci.com/pipelines/workflows/${process.env.CIRCLE_WORKFLOW_ID}|View on CircleCI>`,
    attachments: [],
  },
};

const result = JSON.parse(fs.readFileSync(file, 'utf-8'))
const testRunResult = {
  color: '#36a64f',
  title: `Started at: *${result.startTime}`,
  text: `Executed ${result.total} in ${(new Date(result.endTime) - new Date(result.startTime)) / 1000}s`,
  fields: [
    {
      title: 'Passed',
      value: result.passed,
      short: true,
    },
    {
      title: 'Skipped',
      value: result.skipped,
      short: true,
    },
  ],
};
const failed = result.total - result.passed;
if (failed) {
  results.passed = false;
  testRunResult.color = '#cc0000';
  testRunResult.fields.push({
    title: 'Failed',
    value: failed,
    short: true,
  });
}

results.message.attachments.push(testRunResult);

if (results.passed === false) {
  results.message.text = '<!here> ' + results.message.text;
}

fs.writeFileSync('e2e.report.json', JSON.stringify({
  channel: process.env.SLACK_TEST_REPORT_CHANNEL,
  ...results.message,
}));
