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


    const commentMessage = `Add at least one of the required labels to this PR \n\n Required labels are : ${requiredLabels}`,
      commentMessageWithUserName = `Hi @{USER}! ${commentMessage}`;

    // get list of PR labels
    const listOfLabelsInPR = getListOfLabels()
    core.info(`listOfLabelsInPR ${listOfLabelsInPR}`);
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

    // const requiredMilestone = core.getInput('required_milestone');
    // core.info(`[debug] requiredMilestone=${requiredMilestone}`)
    // const milestone = getMilestone()
    // if (requiredMilestone === 'true' && milestone === null) {
    //   const errorMsg = 'No milestone is set, please set a sprint to it !'
    //   core.error(errorMsg)
    //   core.setFailed(errorMsg)
    // }

    const requiredAssignee = core.getInput('required_assignee');
    const assignees = getListOfAssignees()
    core.info(`[debug] requiredAssignee=${requiredAssignee}`)
    core.info(`[debug] assignees=${assignees}`)
    if (requiredAssignee === 'true' && assignees.length === 0) {
      const errorMsg = 'No Assignee is set, please assign to yourself !'
      core.error(errorMsg)
      core.setFailed(errorMsg)
    }
  } catch(e) {
    core.error(e.message)
    core.setFailed('General Error ', e.message)
  }
})()
