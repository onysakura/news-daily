let axios = require('axios');
const cheerio = require("cheerio");
const {Octokit} = require("@octokit/action");

const octokit = new Octokit();
const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

const fetchData = async () => {
    const list = [];
    try {
        console.log('start fetching list');
        let res = await axios.get('https://www.zhihu.com/rss', {
            headers: {
                Accept: 'application/xml'
            }
        });
        if (res.data) {
            let data = res.data
                .replace('&lt;', '<')
                .replace('&gt;', '>')
                .replace('&amp;', '&')
            ;
            const $ = await cheerio.load(data, {xmlMode: true});
            $('rss channel item').each((a, b) => {
                const title = $(b).find('title').text();
                const link = $(b).find('link').text();
                const description = $(b).find('description').text();
                const pubDate = $(b).find('pubDate').text();
                const guid = $(b).find('guid').text();
                if (title) {
                    list.push({title, link, description, pubDate, guid});
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
    let title = 'Zhihu RSS' + date.toISOString().substr(0, 10);
    let labels = ['zhihu rss'];
    let body = '知乎每日精选 ' + date.toISOString().substr(0, 10);
    const {data} = await octokit.issues.create({owner, repo, title, body, labels});
    console.log(data);
    let issue_number = date.id;
    for (let item of res) {
        let number = Date.parse(item.pubDate) + 8 * 60 * 60 * 1000;
        console.log(number);
        let pubDate = new Date(number).toISOString().substr(0, 19).replace('T', ' ');
        body = `### [${item.title}](${item.guid})\n`
        body += pubDate + '\n\n';
        body += `${item.description}\n\n`
        octokit.issues.createComment({owner, repo, issue_number, body});
    }
}

run(new Date()).catch(err => {
    throw err
});