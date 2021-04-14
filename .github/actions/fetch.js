const {Octokit} = require("@octokit/action");

const octokit = new Octokit();

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

// const open = async ({title, body}) => {
//     try {
//         console.log('opening issue');
//         const res = await octokit.request('POST https://api.github.com/repos/{owner}/{repo}/issues', {
//             owner,
//             repo,
//             title,
//             body,
//         });
//         console.log('opened');
//         return res;
//     } catch (error) {
//         console.log(error);
//         throw error;
//     }
// }
//
// const lock = async ({owner, repo, issueNumber}) => {
//     console.log('locking issue');
//     await octokit.request('PUT /repos/{owner}/{repo}/issues/{issue_number}/lock', {
//         owner: owner,
//         repo: repo,
//         issue_number: issueNumber,
//         lock_reason: 'resolved'
//     });
//     console.log('locked');
// }

const run = async (date) => {
    console.log(date);
    let title = new Date().toISOString();
    const {issue} = await octokit.issues.create({owner, repo, title});
    console.log(issue);
    // const res = await open({
    //     title: `v2ex rss @${new Date(date).toISOString().slice(0, 10)}`,
    //     body: 'asdd'
    // });
    // const issueNumber = res.data.number;
    // await lock({
    //     issueNumber,
    // });
}

run(new Date()).catch(err => {
    throw err
});