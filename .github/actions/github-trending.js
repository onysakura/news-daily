const axios = require('axios');
const {Octokit} = require("@octokit/action");
const cheerio = require("cheerio");

const octokit = new Octokit();

const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

const fetchData = async () => {
    const list = [];
    try {
        console.log('start fetching list');
        let res = await axios.get('https://github.com/trending');
        if (res.data) {
            const $ = await cheerio.load(res.data);
            const $repoList = $('.Box .Box-row');
            $repoList.each((a, b) => {
                const repoTitleA = $(b).find('>h1>a');
                const repoHref = repoTitleA.attr('href');
                const repoDesc = $(b).find('>p').text().replace(/\n/g, '').trim();
                list.push({
                    href: repoHref,
                    description: repoDesc
                });
            });
        } else {
            throw new Error('get html error')
        }
    } catch (e) {
        console.warn(e);
    }
    return list;
}

const run = async (date) => {
    console.log(date);
    let res = await fetchData();
    console.log(res);
    let title = 'Github Trending ' + new Date().toISOString().replace('T', ' ').replace('Z', '');
    let labels = ['github trending'];
    let body = '';
    for (let item of res) {
        body += `- ### [**${item.href.substr(1)}**](https://github.com${item.href})\n\n`
        body += `    ${item.description}\n\n`
    }
    const {data} = await octokit.issues.create({owner, repo, title, body, labels});
    console.log(data);
}

run(new Date()).catch(err => {
    throw err
});