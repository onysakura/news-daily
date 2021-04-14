const {Octokit} = require("@octokit/action");

const octokit = new Octokit();

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

const run = async (date) => {
    console.log(date);
    let title = new Date().toISOString();
    let body = 'aaaaaaaaaaaaa';
    const {data} = await octokit.issues.create({owner, repo, title, body});
    console.log(data);
}

run(new Date()).catch(err => {
    throw err
});