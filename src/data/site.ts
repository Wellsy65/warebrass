import wordpress from './wordpress.json';
import news from './news.json';

export const site = {
  name: 'Ware Brass',
  strapline: 'A Second Section band based in East Hertfordshire',
  description: 'Ware Brass is a traditional brass band making music in Hertfordshire for more than 150 years.',
  email: 'warebrass@outlook.com',
  rehearsal: 'Monday evenings, 7:45–10pm',
  rehearsalVenue: 'High Cross Village Hall, North Drive, High Cross, Ware SG11 1AN',
  muzodoKey: '958F5465-A892-7324-0A10-03E7E6FD5B8B',
  social: {
    facebook: 'https://www.facebook.com/warebrass',
    x: 'https://twitter.com/warebrass',
    youtube: 'https://www.youtube.com/channel/UC6LN-u_AMzPUWGg-XGFovvg/featured',
  },
};

export const pages = wordpress.pages;
export const posts = [...news, ...wordpress.posts].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
export const attachments = wordpress.attachments;

export const getPage = (path: string) => pages.find((page) => page.path === path);
export const formatDate = (date: string) => new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London',
}).format(new Date(date));
