const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const MEDIUM_RSS_FEED_URL = 'https://medium.com/feed/@eshariq.am';

// Function to fetch and parse Medium RSS feed
async function fetchMediumBlogs() {
  try {
    // Fetch the RSS feed
    const response = await axios.get(MEDIUM_RSS_FEED_URL);
    const data = response.data;

    // Parse the RSS feed using Cheerio
    const $ = cheerio.load(data, { xmlMode: true });
    const items = $('item');

    // Extract titles and links from the feed
    const blogs = [];
    items.each((index, element) => {
      const title = $(element).find('title').text();
      const link = $(element).find('link').text();
      blogs.push({ title, link });
    });

    return blogs;
  } catch (error) {
    console.error('Error fetching Medium blogs:', error);
    return [];
  }
}

// Function to update the README file
async function updateReadme() {
  const blogs = await fetchMediumBlogs();

  // Read the existing README file
  let readmeContent = fs.readFileSync('README.md', 'utf-8');

  // Find the section where blogs will be inserted or update it
  const blogsSectionStart = '## My Blogs on Medium';
  const blogsSectionEnd = 'Check out my Medium profile';
  const startIdx = readmeContent.indexOf(blogsSectionStart);
  const endIdx = readmeContent.indexOf(blogsSectionEnd);

  if (startIdx !== -1 && endIdx !== -1) {
    // Extract the part to update
    const existingSection = readmeContent.substring(startIdx, endIdx);
    let newSection = `## My Blogs on Medium\n\nHere are some of my latest blogs on Medium:\n\n`;

    blogs.forEach(blog => {
      newSection += `- [${blog.title}](${blog.link})\n`;
    });

    newSection += '\nCheck out my Medium profile [here](https://medium.com/@eshariq.am).\n';

    // Replace the old section with the new section
    readmeContent = readmeContent.replace(existingSection, newSection);

    // Write the updated content back to the README file
    fs.writeFileSync('README.md', readmeContent, 'utf-8');
  }
}

updateReadme();
