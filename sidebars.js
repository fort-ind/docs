// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  // Main docs section
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Issues - Troubleshooting',
      link: {
        type: 'generated-index',
      },
      items: ['tutorial-basics/create-a-page', 'tutorial-basics/flash'],
    },
    {
      type: 'category',
      label: 'Games',
      link: {
        type: 'generated-index',
      },
      items: ['tutorial-extras/compiling-flash', 'tutorial-extras/gamemaker'],
    },
  ],

  // fort.uwp docs section
  fortUwpSidebar: [
    'fort.uwp docs+dev/intro',
    {
      type: 'category',
      label: 'How It Works',
      link: {
        type: 'generated-index',
      },
      items: [
        'fort.uwp docs+dev/how-it-works',
        'fort.uwp docs+dev/sign-in-and-accounts',
        'fort.uwp docs+dev/search',
        'fort.uwp docs+dev/settings-and-customization',
      ],
    },
    'fort.uwp docs+dev/building',
    'fort.uwp docs+dev/troubleshooting',
    'fort.uwp docs+dev/contributing',
  ],

  // fort.social docs section
  fortSocialSidebar: ['fort.social stuff/intro'],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */
};

export default sidebars;
