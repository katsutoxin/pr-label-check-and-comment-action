const delve = require('delve')
const { Octokit } = require('@octokit/core');
const github = require('@actions/github');
const core = require('@actions/core');

const auth = core.getInput('GITHUB_TOKEN');
const { request } = new Octokit({ auth });

const __getRequestInfo = context => {
  core.info('DD context=', JSON.stringify(context, null, 2))

  const PR = delve(context, 'payload.pull_request', '');

  return {
    issueNumber: delve(PR, 'number', ''),
    repo: delve(context, 'payload.repository.name', ''),
    owner: delve(context, 'payload.repository.owner.login', ''),
    prUser: delve(context, 'payload.pull_request.user.login', '')
  }
}

const getListOfLabels = () => {
  core.info(`LL pull_request = ${JSON.stringify(github.context.payload.pull_request, null, 2)}`)
  const prLabels = delve(github.context, 'payload.pull_request.labels', [])

  return prLabels;
}

const getListOfAssignees = () => {
  // core.info(`LLL pull_request=${JSON.stringify(github.context.payload.pull_request, null, 2)}`)

  const prAssignees = delve(github.context, 'payload.pull_request.assignees', [])

  return prAssignees;
}

const getMilestone = () => {
  // core.info(`MM pull_request=${JSON.stringify(github.context.payload.pull_request, null, 2)}`)
  const prMilestone = delve(github.context, 'payload.pull_request.milestone', null)

  return prMilestone;
}

const doesPrHasLabels = (requiredLabels, listOfLabelsInPR) => {
  return requiredLabels.split(',').filter(label => {
    return listOfLabelsInPR.map(label => label.name.trim()).includes(label.trim())
  });
}

const commentPr = async body => {
  const {
    issueNumber,
    repo,
    owner,
    prUser
  } = __getRequestInfo(github.context);

  let response,
    error,
    isError = false;
  const bodyWithUserName = body.replace('{USER}', prUser);

  try {
    response = await request(`POST /repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
      body: bodyWithUserName,
    })
  } catch (e) {
    isError = true;
    error = e;
  }

  return {
    response,
    error,
    isError
  }
}

module.exports = {
  commentPr,
  getListOfLabels,
  getMilestone,
  getListOfAssignees,
  doesPrHasLabels
}
