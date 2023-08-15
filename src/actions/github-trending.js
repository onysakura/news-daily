import axios from 'axios';
import * as cheerio from 'cheerio';
import { Octokit } from '@octokit/action';
const octokit = new Octokit();
const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/');
const fetchData = async () => {
    const list = [];
    try {
        console.log('start fetching list');
        let res = await axios.get('https://github.com/trending');
        if (res.data) {
            const $ = await cheerio.load(res.data);
            const $repoList = $('.Box .Box-row');
            $repoList.each((a, b) => {
                const repoTitleA = $(b).find('>h2>a');
                const repoHref = repoTitleA.attr('href');
                const repoDesc = $(b).find('>p').text().replace(/\n/g, '').trim();
                const repoStars = $(b).find('div>a.Link>svg[aria-label="star"]').parent().text().trim().replace(/,/g, '');
                list.push({
                    stars: Number(repoStars),
                    href: repoHref,
                    description: repoDesc
                });
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
    console.log(res);
    let title = date.toISOString().substring(0, 10) + ' Github Trending';
    let labels = ['github'];
    let body = '';
    for (let item of res) {
        body += `- ### ${isNaN(item.stars) ? '' : item.stars} [**${item.href.substring(1)}**](https://github.com${item.href})\n\n`;
        body += `    ${item.description}\n\n`;
    }
    const { data } = await octokit.issues.create({ owner, repo, title, body, labels });
    console.log(data);
};
run(new Date()).catch((err) => {
    throw err;
});
//# sourceMappingURL=github-trending.js.map