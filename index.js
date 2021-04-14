const issue = require('./src/issue');

const run = async (date) => {
    console.log(date);
    const res = await issue.open({
        owner: 'guojp-temp',
        repo: 'v2ex-rss',
        title: `v2ex rss @${new Date(date).toISOString().slice(0, 10)}`,
        body: 'asdd'
    });
    const issueNumber = res.data.number;
    await issue.lock({
        owner: 'guojp-temp',
        repo: 'v2ex-rss',
        issueNumber,
    });
}

run(new Date()).catch(err => {
    throw err
});