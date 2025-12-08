import { getPermalink, getBlogPermalink, getAsset } from './utils/permalinks';

export const headerData = {
  links: [
    {
      text: 'Usługi',
      href: getPermalink('/automatyzacja-procesow-biznesowych'),
    },
    {
      text: 'O nas',
      href: getPermalink('/o-nas'),
    },
    {
      text: 'Blog',
      href: getBlogPermalink(),
    },
    {
      text: 'Kontakt',
      href: getPermalink('/kontakt'),
    },
    // Zakomentowane - stare menu do ewentualnego przywrócenia w przyszłości
    // {
    //   text: 'Homes',
    //   links: [
    //     {
    //       text: 'SaaS',
    //       href: getPermalink('/homes/saas'),
    //     },
    //     {
    //       text: 'Startup',
    //       href: getPermalink('/homes/startup'),
    //     },
    //     {
    //       text: 'Mobile App',
    //       href: getPermalink('/homes/mobile-app'),
    //     },
    //     {
    //       text: 'Personal',
    //       href: getPermalink('/homes/personal'),
    //     },
    //   ],
    // },
    // {
    //   text: 'Pages',
    //   links: [
    //     {
    //       text: 'Features (Anchor Link)',
    //       href: getPermalink('/#features'),
    //     },
    //     {
    //       text: 'Services',
    //       href: getPermalink('/services'),
    //     },
    //     {
    //       text: 'Pricing',
    //       href: getPermalink('/pricing'),
    //     },
    //     {
    //       text: 'About us',
    //       href: getPermalink('/about'),
    //     },
    //     {
    //       text: 'Contact',
    //       href: getPermalink('/contact'),
    //     },
    //     {
    //       text: 'Terms',
    //       href: getPermalink('/terms'),
    //     },
    //     {
    //       text: 'Privacy policy',
    //       href: getPermalink('/privacy'),
    //     },
    //   ],
    // },
    // {
    //   text: 'Landing',
    //   links: [
    //     {
    //       text: 'Lead Generation',
    //       href: getPermalink('/landing/lead-generation'),
    //     },
    //     {
    //       text: 'Long-form Sales',
    //       href: getPermalink('/landing/sales'),
    //     },
    //     {
    //       text: 'Click-Through',
    //       href: getPermalink('/landing/click-through'),
    //     },
    //     {
    //       text: 'Product Details (or Services)',
    //       href: getPermalink('/landing/product'),
    //     },
    //     {
    //       text: 'Coming Soon or Pre-Launch',
    //       href: getPermalink('/landing/pre-launch'),
    //     },
    //     {
    //       text: 'Subscription',
    //       href: getPermalink('/landing/subscription'),
    //     },
    //   ],
    // },
    // {
    //   text: 'Blog',
    //   links: [
    //     {
    //       text: 'Blog List',
    //       href: getBlogPermalink(),
    //     },
    //     {
    //       text: 'Article',
    //       href: getPermalink('get-started-website-with-astro-tailwind-css', 'post'),
    //     },
    //     {
    //       text: 'Article (with MDX)',
    //       href: getPermalink('markdown-elements-demo-post', 'post'),
    //     },
    //     {
    //       text: 'Category Page',
    //       href: getPermalink('tutorials', 'category'),
    //     },
    //     {
    //       text: 'Tag Page',
    //       href: getPermalink('astro', 'tag'),
    //     },
    //   ],
    // },
    // {
    //   text: 'Widgets',
    //   href: '#',
    // },
  ],
  actions: [{ text: 'UczciweSEO', href: 'https://uczciweseo.pl', target: '_blank', class: 'btn-uczciweseo' }],
};

export const footerData = {
  links: [
    {
      title: 'Menu',
      links: [
        { text: 'Usługi', href: getPermalink('/automatyzacja-procesow-biznesowych') },
        { text: 'O nas', href: getPermalink('/o-nas') },
        { text: 'Kontakt', href: getPermalink('/kontakt') },
        { text: 'Blog', href: getBlogPermalink() },
        { text: 'Automatyzacja dla miast', href: getPermalink('/automatyzacja-dla-miast') },
      ],
    },
  ],
  secondaryLinks: [
    { text: 'Regulamin', href: getPermalink('/regulamin') },
    { text: 'Polityka Prywatności', href: getPermalink('/polityka-prywatnosci') },
  ],
  socialLinks: [
    { ariaLabel: 'Facebook', icon: 'tabler:brand-facebook', href: 'https://www.facebook.com/uczciweit' },
    { ariaLabel: 'LinkedIn', icon: 'tabler:brand-linkedin', href: 'https://www.linkedin.com/company/uczciweit' },
    { ariaLabel: 'RSS', icon: 'tabler:rss', href: getAsset('/rss.xml') },
  ],
  footNote: `
    © ${new Date().getFullYear()} <a class="text-blue-600 underline dark:text-muted" href="https://uczciweit.pl">UczciweIT</a> - EXELMEDIA SP. Z O.O. · Wszelkie prawa zastrzeżone.
  `,
};
