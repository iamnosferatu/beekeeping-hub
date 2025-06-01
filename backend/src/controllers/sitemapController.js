// backend/src/controllers/sitemapController.js
const { Article, Tag, User } = require('../models');
const { Op } = require('sequelize');
const db = require('../models');

/**
 * Generate XML sitemap for search engines
 */
exports.generateXMLSitemap = async (req, res, next) => {
  try {
    // Get base URL from environment or request
    const baseUrl = process.env.SITE_URL || `${req.protocol}://${req.get('host')}`.replace(':8080', ':3000');
    
    // Fetch all published articles
    const articles = await Article.findAll({
      where: {
        status: 'published'
      },
      attributes: ['slug', 'updated_at'],
      order: [['updated_at', 'DESC']]
    });

    // Fetch all tags
    const tags = await Tag.findAll({
      attributes: ['slug', 'updated_at']
    });

    // Start building XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/articles', priority: '0.9', changefreq: 'daily' },
      { url: '/about', priority: '0.7', changefreq: 'monthly' },
      { url: '/contact', priority: '0.7', changefreq: 'monthly' },
      { url: '/privacy', priority: '0.5', changefreq: 'yearly' },
      { url: '/terms', priority: '0.5', changefreq: 'yearly' },
      { url: '/login', priority: '0.5', changefreq: 'yearly' },
      { url: '/register', priority: '0.5', changefreq: 'yearly' }
    ];

    // Add static pages to sitemap
    staticPages.forEach(page => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    // Add articles to sitemap
    articles.forEach(article => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/articles/${article.slug}</loc>\n`;
      xml += `    <lastmod>${article.updated_at.toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // Add tag pages to sitemap
    tags.forEach(tag => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}/tags/${tag.slug}</loc>\n`;
      if (tag.updated_at) {
        xml += `    <lastmod>${tag.updated_at.toISOString().split('T')[0]}</lastmod>\n`;
      }
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.6</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';

    // Set appropriate headers
    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    next(error);
  }
};

/**
 * Get sitemap data for HTML sitemap page
 */
exports.getSitemapData = async (req, res, next) => {
  try {
    // Fetch published articles grouped by month
    const articles = await Article.findAll({
      where: {
        status: 'published'
      },
      attributes: ['id', 'title', 'slug', 'created_at'],
      order: [['created_at', 'DESC']],
      include: [{
        model: User,
        as: 'author',
        attributes: ['username']
      }]
    });

    // Fetch all tags with article count
    const tags = await Tag.findAll({
      attributes: [
        'id',
        'name',
        'slug',
        'description',
        [
          db.sequelize.literal(
            '(SELECT COUNT(*) FROM article_tags WHERE article_tags.tag_id = Tag.id)'
          ),
          'article_count'
        ]
      ],
      having: db.sequelize.literal('article_count > 0'),
      order: [[db.sequelize.literal('article_count'), 'DESC']]
    });

    // Group articles by year and month
    const articlesByDate = {};
    articles.forEach(article => {
      const date = new Date(article.created_at);
      const year = date.getFullYear();
      const month = date.toLocaleString('default', { month: 'long' });
      
      if (!articlesByDate[year]) {
        articlesByDate[year] = {};
      }
      if (!articlesByDate[year][month]) {
        articlesByDate[year][month] = [];
      }
      
      articlesByDate[year][month].push({
        id: article.id,
        title: article.title,
        slug: article.slug,
        author: article.author?.username || 'Unknown'
      });
    });

    // Static pages structure
    const staticPages = {
      main: [
        { title: 'Home', path: '/' },
        { title: 'Articles', path: '/articles' },
        { title: 'About', path: '/about' },
        { title: 'Contact', path: '/contact' }
      ],
      legal: [
        { title: 'Privacy Policy', path: '/privacy' },
        { title: 'Terms of Service', path: '/terms' }
      ],
      account: [
        { title: 'Login', path: '/login' },
        { title: 'Register', path: '/register' },
        { title: 'Profile', path: '/profile', requiresAuth: true }
      ]
    };

    res.status(200).json({
      success: true,
      data: {
        staticPages,
        articlesByDate,
        tags: tags.map(tag => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          description: tag.description,
          articleCount: tag.dataValues.article_count
        })),
        totalArticles: articles.length,
        totalTags: tags.length
      }
    });
  } catch (error) {
    console.error('Error fetching sitemap data:', error);
    next(error);
  }
};