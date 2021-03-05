const core = require('@actions/core');
const { getListOfLabels, commentPr, doesPrHasLabels, getListOfAssignees, getMilestone } = require('./utils/utils.js');

(async function () {
  try {
    const requiredLabels = core.getInput('required_labels');

    if (!requiredLabels) {
      core.error('No required labels specified. At least one required label needed for this action work.')
    } else {
      core.info(`List of required labels -> ${requiredLabels}`)
    }

    const requiredMilestone = core.getInput('required_milestone');
    core.info(`[debug] requiredMilestone=${requiredMilestone}`)
    if (requiredMilestone === 'true' && getMilestone() === null) {
      core.error('No milestone is set, please set a sprint to it !')
    }

    const requiredAssignees = core.getInput('required_assignees');
    if (requiredAssignees === 'true' && getListOfAssignees().length === 0) {
      core.error('No Assignee is set, please assign to yourself !')
    }

    const commentMessage = `Add at least one of the required labels to this PR \n\n Required labels are : ${requiredLabels}`,
      commentMessageWithUserName = `Hi @{USER}! ${commentMessage}`;

    // get list of PR labels
    const listOfLabelsInPR = getListOfLabels()
    console.log('listOfLabelsInPR', listOfLabelsInPR);
    // labels in PR is 0
    if (listOfLabelsInPR.length === 0) {
      try {
        await commentPr(commentMessageWithUserName)
      } catch (e) {
        core.error(`Error commenting on PR. Status: ${e.status}`)
      }
      core.setFailed(commentMessage)
    } else {
      core.info(`List of PR Labels -> ${listOfLabelsInPR}`)
      const commonRequiredAndPrLabels = doesPrHasLabels(requiredLabels, listOfLabelsInPR)

      if (commonRequiredAndPrLabels.length === 0) {
        await commentPr(commentMessageWithUserName)
        core.setFailed(commentMessage)
      } else {
        core.info(`Matched PR labels ${commonRequiredAndPrLabels}`)
      }
    }
  } catch(e) {
    core.error(e.message)
    core.setFailed('General Error ', e.message)
  }
})()
