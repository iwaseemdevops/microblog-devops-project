const { PrismaClient } = require('@prisma/client');
const { hashSync } = require('bcryptjs');
const slugify = require('slugify');

const prisma = new PrismaClient();

// Simple data generation functions
const generateUserData = () => {
  const usernames = ['johndoe', 'janedoe', 'alice', 'bob', 'charlie'];
  const emails = usernames.map((username) => `${username}@example.com`);
  return usernames.map((username, index) => ({
    username,
    email: emails[index],
    password: hashSync('password123', 10),
    image: 'https://api.realworld.io/images/smiley-cyrus.jpeg',
    bio: `I'm ${username}, a test user.`,
    demo: true,
  }));
};

const generateArticleData = (users, tags) => {
  const titles = [
    'How to build a REST API with Express',
    'Introduction to Prisma',
    'Docker for Developers',
    'React Best Practices',
    'Microservices Architecture',
  ];

  return titles.map((title, index) => ({
    title,
    slug: slugify(title, { lower: true, strict: true }),
    description: `This is a sample article about ${title.toLowerCase()}`,
    body: `This is the full content of the article about ${title.toLowerCase()}. It contains detailed information and examples.`,
    author: { connect: { id: users[index % users.length].id } },
    tagList: {
      connect: tags.map((tag) => ({ id: tag.id })),
    },
  }));
};

const generateCommentData = (articles, users) => {
  return articles.flatMap((article, articleIndex) =>
    users.map((user, userIndex) => ({
      body: `This is a comment from ${user.username} on the article "${article.title}"`,
      article: { connect: { id: article.id } },
      author: { connect: { id: user.id } },
    }))
  );
};

async function main() {
  console.log('Starting seed process...');

  // Clean existing data (in correct order to respect foreign keys)
  await prisma.comment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tag.deleteMany();

  // Create tags first
  const tagNames = ['programming', 'technology', 'webdev'];
  const tags = await Promise.all(
    tagNames.map((name) => prisma.tag.create({ data: { name } }))
  );
  console.log(`Created ${tags.length} tags`);

  // Create users
  const userData = generateUserData();
  const users = await Promise.all(
    userData.map((user) => prisma.user.create({ data: user }))
  );
  console.log(`Created ${users.length} users`);

  // Create articles with tags
  const articleData = generateArticleData(users, tags);
  const articles = await Promise.all(
    articleData.map((article) => prisma.article.create({ data: article }))
  );
  console.log(`Created ${articles.length} articles`);

  // Create comments
  const commentData = generateCommentData(articles, users);
  const comments = await Promise.all(
    commentData.map((comment) => prisma.comment.create({ data: comment }))
  );
  console.log(`Created ${comments.length} comments`);

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
