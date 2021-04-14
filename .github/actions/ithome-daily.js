const axios = require('axios');
const cheerio = require("cheerio");
const {Octokit} = require("@octokit/action");
const octokit = new Octokit();
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

const fetchData = async () => {
    const obj = {};
    try {
        console.log('start fetching list');
        let res = await axios.get('https://www.ithome.com/block/rank.html');
        if (res.data) {
            const $ = await cheerio.load(res.data);
            {
                const $newsList = $('#d-1>li');
                getData($, $newsList, 'Day', obj);
            }
            {
                const $newsList = $('#d-2>li');
                getData($, $newsList, 'Week', obj);
            }
            {
                const $newsList = $('#d-3>li');
                getData($, $newsList, 'Month', obj);
            }
        } else {
            throw new Error('get html error');
        }
    } catch (e) {
        console.warn(e);
    }
    return obj;
};

const getData = ($, $newsList, type, obj) => {
    let list = [];
    $newsList.each((a, b) => {
        const newsTitleA = $(b).find('>a');
        const title = newsTitleA.text();
        const href = newsTitleA.attr('href');
        list.push({
            title: title,
            href: href
        });
    });
    obj[type] = list;
};

const run = async (date) => {
    console.log(date);
    let res = await fetchData();
    console.log(res);
    let title = 'Github Trending ' + new Date().toISOString().replace('T', ' ').replace('Z', '');
    let labels = ['ithome daily'];
    let body = '';
    for (let type in res) {
        let list = res[type];
        body += `## ${type}\n`
        for (let item of list) {
            body += `- #### [**${item.title}**](${item.href})\n`
        }
    }
    const {data} = await octokit.issues.create({owner, repo, title, body, labels});
    console.log(data);
}

run(new Date()).catch(err => {
    throw err;
});