import axios from 'axios';
import * as cheerio from 'cheerio';
import { Octokit } from '@octokit/action';
import { Category, DateType } from '@/actions/types';

const octokit = new Octokit();
const [owner, repo] = process.env.GITHUB_REPOSITORY!.split('/');

const fetchData = async () => {
    const obj: Category = {
        day: [],
        month: [],
        week: []
    };
    try {
        console.log('start fetching list');
        let res = await axios.get('https://www.ithome.com/block/rank.html');
        if (res.data) {
            const $ = await cheerio.load(res.data);
            getData($, $('#d-1>li'), 'day', obj);
            getData($, $('#d-2>li'), 'week', obj);
            getData($, $('#d-3>li'), 'month', obj);
        } else {
            console.warn('get html error');
        }
    } catch (e) {
        console.warn(e);
    }
    return obj;
};

const getData = ($: any, $newsList: any, type: DateType, obj: Category) => {
    let list: { title: any; href: any }[] = [];
    $newsList.each((a: any, b: any) => {
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

const run = async (date: Date) => {
    console.log(date);
    let res = await fetchData();
    console.log(res);
    let title = date.toISOString().substring(0, 10) + ' ITHome Daily';
    let labels = ['ithome'];
    let body = '';
    Object.entries(res).forEach((value) => {
        body += `## ${value[0]}\n`;
        for (let item of value[1]) {
            body += `- #### [**${item.title}**](${item.href})\n`;
        }
    });
    const { data } = await octokit.issues.create({ owner, repo, title, body, labels });
    console.log(data);
};

run(new Date()).catch((err) => {
    throw err;
});
