const core = require('@actions/core');
const github = require('@actions/github');
const Octokit = require("@octokit/rest");
const minimatch = require('minimatch');

(async () => {
  const ghToken = core.getInput('github_token');
  const octokit = new Octokit(ghToken ? { auth: ghToken } : {});
  const paths = core.getInput('paths').split(',');

  // When using pull_request, the context payload.head_commit is undefined. But we have after instead.
  let ref, owner, repo;

  if (github.context.payload.head_commit) {
    ref = github.context.payload.head_commit.id;
    const parts = github.context.payload.repository.full_name.split('/');
    owner = parts[0];
    repo = parts[1];
  }

  if (github.context.payload.pull_request) {
    ref = github.context.payload.pull_request.head.sha;
    const parts = github.context.payload.pull_request.head.repo.full_name.split('/');
    owner = parts[0];
    repo = parts[1];
  }

  if (!ref) {
    core.info(JSON.stringify(github.context.payload, null, 2));
    core.setOutput('modified', true);
    return
  }

  const { data: { files }, err } = await octokit.repos.getCommit({ owner, repo, ref })
  if (err) {
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
