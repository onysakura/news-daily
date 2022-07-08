import axios from 'axios';
import * as cheerio from 'cheerio';
import { Octokit } from '@octokit/action';
const octokit = new Octokit();
const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
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
            let data = res.data.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&');
            const $ = await cheerio.load(data, { xmlMode: true });
            $('rss channel item').each((a, b) => {
                const title = $(b).find('title').text();
                const link = $(b).find('link').text();
                const description = $(b).find('description').text().substring(0, 1000);
                const pubDate = $(b).find('pubDate').text();
                const guid = $(b).find('guid').text();
                if (title) {
                    list.push({ title, link, description, pubDate, guid });
                }
            });
        }
        else {
            console.warn('get html error');
        }
    }
    catch (e) {
        console.warn(e);
    }
    return list;
};
const run = async (date) => {
    console.log(date);
    let res = await fetchData();
    let title = date.toISOString().substring(0, 10) + ' Zhihu RSS';
    let labels = ['zhihu'];
    let body = '知乎每日精选 ' + date.toISOString().substring(0, 10);
    const { data } = await octokit.issues.create({ owner, repo, title, body, labels });
    console.log(data);
    let issue_number = data.number;
    for (let item of res) {
        let number = Date.parse(item.pubDate) + 8 * 60 * 60 * 1000;
        let pubDate = new Date(number).toISOString().substring(0, 19).replace('T', ' ');
        body = `### [${item.title}](${item.guid})\n`;
        body += '`' + pubDate + '`\n\n';
        body += `${item.description}\n\n`;
        await octokit.issues.createComment({ owner, repo, issue_number, body });
    }
};
run(new Date()).catch((err) => {
    throw err;
});
//# sourceMappingURL=zhihu-rss.js.map