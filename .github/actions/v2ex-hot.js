const axios = require('axios');
const cheerio = require("cheerio");
const {Octokit} = require("@octokit/action");

const octokit = new Octokit();
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

const fetchData = async () => {
    const list = [];
    try {
        console.log('start fetching list');
        let res = await axios.get('https://v2ex.com/?tab=hot');
        if (res.data) {
            const $ = await cheerio.load(res.data);
            $('#Wrapper #Main .box table tr').each((a, b) => {
                const titleA = $(b).find('.item_title a');
                const href = titleA.attr('href');
                const title = titleA.text();
                const count = $(b).find('.count_livid').text();
                const tab = $(b).find('.topic_info .node').text();
                if (title) {
                    list.push({href, title, count, tab});
                }
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
    let title = 'V2ex Hot ' + date.toISOString().substr(0, 10)
    let labels = ['v2ex hot'];
    let body = '';
    for (let item of res) {
        body += `- ### ${item.count} [${item.title}](https://v2ex.com${item.href}) \`${item.tab}\`\n`
    }
    const {data} = await octokit.issues.create({owner, repo, title, body, labels});
    console.log(data);
}

run(new Date()).catch(err => {
    throw err
});