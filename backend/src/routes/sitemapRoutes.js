// backend/src/routes/sitemapRoutes.js
const express = require('express');
const router = express.Router();
const sitemapController = require('../controllers/sitemapController');

/**
 * @route   GET /api/sitemap.xml
 * @desc    Generate XML sitemap for search engines
 * @access  Public
 */
router.get('/sitemap.xml', sitemapController.generateXMLSitemap);

/**
 * @route   GET /api/sitemap
 * @desc    Get sitemap data for HTML sitemap page
 * @access  Public
 */
router.get('/sitemap', sitemapController.getSitemapData);

module.exports = router;