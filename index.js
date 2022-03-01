const core = require('@actions/core');
const github = require('@actions/github');
const Octokit = require("@octokit/rest");
const minimatch = require('minimatch');

(async () => {
  const ghToken = core.getInput('github_token');
  const octokit = new Octokit(ghToken ? { auth: ghToken } : {});
  const paths = core.getInput('paths').split(',');
  core.info(JSON.stringify(paths, null, 2));

  // When using pull_request, the context payload.head_commit is undefined. But we have after instead.
  let ref;

  try {
    ref = github.context.payload.head_commit ?
      github.context.payload.head_commit.id : github.context.payload.pull_request.base.sha;
  } catch {
    core.info(JSON.stringify(github.context.payload, null, 2));
  }

  core.info(JSON.stringify(github.context.payload, null, 2));

  if (!ref) {
    core.info('failed to get ref');
    core.setOutput('modified', true);
    return
  }

  const [owner, repo] = github.context.payload.repository.full_name.split('/');
  const { data: { files }, err } = await octokit.repos.getCommit({ owner, repo, ref })
  if (err) {
    core.info('got error')
    core.error(err);
    core.setOutput('modified', true);
    return
  }

  if (Array.isArray(files)) {
    const modifiedPaths = files.map(f => f.filename);
    core.info(JSON.stringify(modifiedPaths, null, 2));
    const modified = paths.some(p => minimatch.match(modifiedPaths, p).length);
    core.setOutput('modified', modified);
    return
  }

  core.setOutput('modified', false);
})();
