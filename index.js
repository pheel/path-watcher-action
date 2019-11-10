const core = require('@actions/core');
const github = require('@actions/github');
const Octokit = require("@octokit/rest");
const minimatch = require('minimatch');

try {
  const ghToken = core.getInput('github_token');
  const octokit = new Octokit(ghToken ? { auth: ghToken } : {});
  const paths = core.getInput('paths').split(',');
  const ref = github.context.payload.head_commit.id;
  const [owner, repo] = github.context.payload.repository.full_name.split('/');
  octokit.repos.getCommit({ owner, repo, ref })
    .then(({ data: { files } }, err) => {
      if (err) throw new Error(err);
      if (Array.isArray(files)) {
        const modifiedPaths = files.map(f => f.filename);
        const modified = paths.some(p => minimatch.match(modifiedPaths, p).length);
        core.setOutput('modified', modified);
      } else {
        core.setOutput('modified', false);
      }
  });
} catch (error) {
  core.setFailed(error.message);
}