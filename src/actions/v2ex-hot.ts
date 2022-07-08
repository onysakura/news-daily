import axios from 'axios';
import * as cheerio from 'cheerio';
import { Octokit } from '@octokit/action';
// import HttpsProxyAgent from 'https-proxy-agent';

const octokit = new Octokit();
const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/');
// const httpsAgent = HttpsProxyAgent({ host: '127.0.0.1', port: '7890' });

const fetchData = async () => {
    const list: { href: string | undefined; title: string; count: string; tab: string }[] = [];
    try {
        console.log('start fetching list');
        // let axiosCopy = axios.create({ httpsAgent });
        let res = await axios.get('https://v2ex.com/?tab=hot' /*, { httpsAgent }*/);
        if (res.data) {
            const $ = await cheerio.load(res.data);
            $('#Wrapper #Main .box table tr').each((a, b) => {
                const titleA = $(b).find('.item_title a');
                const href = titleA.attr('href');
                const title = titleA.text();
                const count = $(b).find('.count_livid').text();
                const tab = $(b).find('.topic_info .node').text();
                if (title) {
                    list.push({ href, title, count, tab });
                }
            });
        } else {
            console.warn('get html error');
        }
    } catch (e) {
        console.warn(e);
    }
    return list;
};

const run = async (date: Date) => {
    console.log(date);
    let res = await fetchData();
    console.log(res);
    let title = date.toISOString().substring(0, 10) + ' V2ex Hot';
    let labels = ['v2ex'];
    let body = '';
    for (let item of res) {
        body += `- ### ${item.count} [${item.title}](https://v2ex.com${item.href}) \`${item.tab}\`\n`;
    }
    const { data } = await octokit.issues.create({ owner, repo, title, body, labels });
    console.log(data);
};

run(new Date()).catch((err) => {
    throw err;
});
