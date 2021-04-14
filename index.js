const {Octokit} = require("@octokit/action");

const octokit = new Octokit();

const open = async ({owner, repo, title, body}) => {
    try {
        console.log('opening issue');
        const res = await octokit.request('POST https://api.github.com/repos/{owner}/{repo}/issues', {
            owner,
            repo,
            title,
            body,
        });
        console.log('opened');
        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const lock = async ({owner, repo, issueNumber}) => {
    console.log('locking issue');
    await octokit.request('PUT /repos/{owner}/{repo}/issues/{issue_number}/lock', {
        owner: owner,
        repo: repo,
        issue_number: issueNumber,
        lock_reason: 'resolved'
    });
    console.log('locked');
}

const run = async (date) => {
    console.log(date);
    const res = await open({
        owner: 'guojp-temp',
        repo: 'v2ex-rss',
        title: `v2ex rss @${new Date(date).toISOString().slice(0, 10)}`,
        body: 'asdd'
    });
    const issueNumber = res.data.number;
    await lock({
        owner: 'guojp-temp',
        repo: 'v2ex-rss',
        issueNumber,
    });
}

run(new Date()).catch(err => {
    throw err
});