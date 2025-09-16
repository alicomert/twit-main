// Complete Twitter API Server with integrated configuration
import express from 'express';
import cors from 'cors';
import { Rettiwt } from 'rettiwt-api';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// ===== CONFIGURATION =====
// Twitter API Configuration
const API_KEY = process.env.TWITTER_API_KEY || 'API_KEY';
const BEARER_TOKEN = process.env.BEARER_TOKEN || 'your-secure-bearer-token-here';

// Server Configuration
const PORT = process.env.PORT || 3038;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Optional Configuration
const RATE_LIMIT_WINDOW = 15;
const RATE_LIMIT_MAX = 100;
const LOG_LEVEL = 'info';

// ===== APPLICATION SETUP =====
const app = express();

// Initialize Rettiwt with auth token (user authentication)
const rettiwt = new Rettiwt({ 
  apiKey: API_KEY
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  
  // Log response time
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    console.log(`[${timestamp}] ${method} ${url} - ${status} - ${duration}ms`);
  });
  
  next();
});

// Bearer Token Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required',
      message: 'Please provide a valid Bearer token in Authorization header',
      example: 'Authorization: Bearer your-token-here'
    });
  }

  if (token !== BEARER_TOKEN) {
    return res.status(403).json({
      success: false,
      error: 'Invalid token',
      message: 'The provided token is not valid'
    });
  }

  next();
};

// Basic health check endpoint
app.get('/', (req, res) => {
  const endpoints = {
    'Public Endpoints (No Auth Required)': [
      'GET / - API Information',
      'GET /health - Health Check',
      'GET /user/:username - User Tweets',
      'GET /search - Search Tweets',
      'GET /tweet/:id - Tweet Details',
      'GET /user/:username/info - User Info',
      'GET /advanced-search - Advanced Search'
    ],
    'Protected Endpoints (Bearer Token Required)': [
      'POST /tweet - Post Tweet',
      'POST /upload - Upload Media',
      'POST /tweet/:id/reply - Reply to Tweet',
      'DELETE /tweet/:id - Delete Tweet',
      'POST /tweet/:id/like - Like Tweet',
      'DELETE /tweet/:id/like - Unlike Tweet',
      'POST /tweet/:id/retweet - Retweet',
      'DELETE /tweet/:id/retweet - Unretweet'
    ]
  };

  res.json({
    success: true,
    message: 'Twitter API Server is running! 🐦',
    version: '1.0.0',
    status: 'healthy',
    endpoints: endpoints,
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>',
      required_for: 'All POST/DELETE operations'
    },
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    uptime: process.uptime(),
    examples: [
      `http://localhost:${PORT}/user/elonmusk`,
      `http://localhost:${PORT}/search?q=javascript`,
      `http://localhost:${PORT}/user/elonmusk/info`,
      `http://localhost:${PORT}/tweet/1234567890123456789`
    ]
  });
});

// Dedicated health check endpoint for monitoring
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: '1.0.0',
    services: {
      api: 'operational',
      twitter_api: API_KEY ? 'configured' : 'not_configured',
      authentication: BEARER_TOKEN !== 'your-secure-bearer-token-here' ? 'configured' : 'default_token'
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    system: {
      platform: process.platform,
      node_version: process.version,
      pid: process.pid
    }
  };

  // Check if critical services are working
  if (!API_KEY || API_KEY === 'API_KEY') {
    healthCheck.status = 'degraded';
    healthCheck.warnings = ['Twitter API key not configured'];
  }

  if (BEARER_TOKEN === 'your-secure-bearer-token-here') {
    healthCheck.status = 'degraded';
    if (!healthCheck.warnings) healthCheck.warnings = [];
    healthCheck.warnings.push('Default bearer token in use - security risk');
  }

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

// Get user tweets endpoint
app.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const count = parseInt(req.query.count) || 20;
    
    console.log(`Fetching tweets for user: ${username}`);
    
    // Get user tweets using rettiwt-api with search method
    const searchQuery = {
      fromUsers: [username],
      hasImages: false,
      hasVideos: false
    };
    
    const tweets = await rettiwt.tweet.search(searchQuery, count, null);
    
    if (!tweets || !tweets.list || tweets.list.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No tweets found for this user',
        username: username
      });
    }
    
    res.json({
      success: true,
      username: username,
      count: tweets.list.length,
      tweets: tweets.list.map(tweet => ({
        id: tweet.id,
        text: tweet.fullText,
        createdAt: tweet.createdAt,
        author: tweet.tweetBy?.userName || username,
        likes: tweet.likeCount || 0,
        retweets: tweet.retweetCount || 0,
        replies: tweet.replyCount || 0,
        media: tweet.media?.map(m => ({
          type: m.type,
          url: m.url
        })) || []
      }))
    });
    
  } catch (error) {
    console.error('Error fetching user tweets:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user tweets',
      message: error.message,
      suggestion: 'Try with a different username or check if the user exists'
    });
  }
});

// Search tweets endpoint
app.get('/search', async (req, res) => {
  try {
    const { q: query } = req.query;
    const count = parseInt(req.query.count) || 20;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }
    
    console.log(`Searching tweets for: ${query}`);
    
    // Search tweets using rettiwt-api with proper query format
    const searchQuery = {
      includeWords: [query],
      hasImages: false,
      hasVideos: false
    };
    
    const searchResults = await rettiwt.tweet.search(searchQuery, count, null);
    
    if (!searchResults || !searchResults.list || searchResults.list.length === 0) {
      return res.json({
        success: true,
        query: query,
        count: 0,
        tweets: [],
        message: 'No tweets found for this search query'
      });
    }
    
    res.json({
      success: true,
      query: query,
      count: searchResults.list.length,
      tweets: searchResults.list.map(tweet => ({
        id: tweet.id,
        text: tweet.fullText,
        createdAt: tweet.createdAt,
        author: tweet.tweetBy?.userName || 'unknown',
        likes: tweet.likeCount || 0,
        retweets: tweet.retweetCount || 0,
        replies: tweet.replyCount || 0,
        media: tweet.media?.map(m => ({
          type: m.type,
          url: m.url
        })) || []
      }))
    });
    
  } catch (error) {
    console.error('Error searching tweets:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to search tweets',
      message: error.message,
      suggestion: 'Try with a different search query'
    });
  }
});

// Get specific tweet endpoint
app.get('/tweet/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Fetching tweet with ID: ${id}`);
    
    // Get specific tweet using rettiwt-api
    const tweet = await rettiwt.tweet.details(id);
    
    if (!tweet) {
      return res.status(404).json({
        success: false,
        error: 'Tweet not found',
        tweetId: id
      });
    }
    
    res.json({
      success: true,
      tweet: {
        id: tweet.id,
        text: tweet.fullText,
        createdAt: tweet.createdAt,
        author: tweet.tweetBy?.userName || 'unknown',
        likes: tweet.likeCount || 0,
        retweets: tweet.retweetCount || 0,
        replies: tweet.replyCount || 0,
        media: tweet.media?.map(m => ({
          type: m.type,
          url: m.url
        })) || []
      }
    });
    
  } catch (error) {
    console.error('Error fetching tweet:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tweet',
      message: error.message,
      suggestion: 'Check if the tweet ID is correct and the tweet exists'
    });
  }
});

// Get user information endpoint
app.get('/user/:username/info', async (req, res) => {
  try {
    const { username } = req.params;
    
    console.log(`Fetching user info for: ${username}`);
    
    // Get user details using rettiwt-api
    const userInfo = await rettiwt.user.detailsByUsername(username);
    
    if (!userInfo) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        username: username
      });
    }
    
    res.json({
      success: true,
      user: {
        id: userInfo.id,
        username: userInfo.userName,
        displayName: userInfo.fullName,
        description: userInfo.description,
        followers: userInfo.followersCount || 0,
        following: userInfo.followingCount || 0,
        tweets: userInfo.tweetsCount || 0,
        verified: userInfo.isVerified || false,
        createdAt: userInfo.createdAt,
        profileImage: userInfo.profileImage,
        bannerImage: userInfo.bannerImage,
        location: userInfo.location
      }
    });
    
  } catch (error) {
    console.error('Error fetching user info:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user information',
      message: error.message,
      suggestion: 'Check if the username is correct and the user exists'
    });
  }
});

// Post a new tweet (Bearer Token Required)
app.post('/tweet', authenticateToken, async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'This endpoint requires user authentication',
        message: 'API key is required for posting tweets'
      });
    }

    const { text, media_ids } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Tweet text is required',
        message: 'Please provide tweet content in the "text" field'
      });
    }

    if (text.length > 280) {
      return res.status(400).json({
        success: false,
        error: 'Tweet text too long',
        message: 'Tweet must be 280 characters or less'
      });
    }

    console.log(`Posting new tweet: ${text.substring(0, 50)}...`);
    
    // Prepare options for media if provided
    const options = {};
    if (media_ids && Array.isArray(media_ids) && media_ids.length > 0) {
      options.mediaIds = media_ids;
    }
    
    // Post tweet using rettiwt-api
    const postedTweet = await rettiwt.tweet.post(text, options);
    
    res.json({
      success: true,
      message: 'Tweet posted successfully',
      tweet: {
        id: postedTweet.id,
        text: postedTweet.fullText,
        createdAt: postedTweet.createdAt,
        author: postedTweet.tweetBy?.userName || 'unknown',
        likes: postedTweet.likeCount || 0,
        retweets: postedTweet.retweetCount || 0,
        replies: postedTweet.replyCount || 0,
        media: postedTweet.media?.map(m => ({
          type: m.type,
          url: m.url
        })) || []
      }
    });
    
  } catch (error) {
    console.error('Error posting tweet:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to post tweet',
      message: error.message,
      suggestion: 'Check your API key and tweet content'
    });
  }
});

// Upload media for tweets (Bearer Token Required)
app.post('/upload', authenticateToken, async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'This endpoint requires user authentication',
        message: 'API key is required for uploading media'
      });
    }

    const { media_data, media_type } = req.body;
    
    if (!media_data || !media_type) {
      return res.status(400).json({
        success: false,
        error: 'Media data and type are required',
        message: 'Please provide "media_data" (base64) and "media_type" (image/jpeg, image/png, video/mp4, etc.)'
      });
    }

    // Validate media type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/mov'];
    if (!allowedTypes.includes(media_type.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported media type',
        message: `Supported types: ${allowedTypes.join(', ')}`,
        provided: media_type
      });
    }

    console.log(`Uploading media of type: ${media_type}`);
    
    // Convert base64 to buffer
    const mediaBuffer = Buffer.from(media_data, 'base64');
    
    // Upload media using rettiwt-api
    const mediaId = await rettiwt.tweet.upload(mediaBuffer, media_type);
    
    res.json({
      success: true,
      message: 'Media uploaded successfully',
      media_id: mediaId,
      media_type: media_type,
      size: mediaBuffer.length
    });
    
  } catch (error) {
    console.error('Error uploading media:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to upload media',
      message: error.message,
      suggestion: 'Check your media data format and type'
    });
  }
});

// Reply to a tweet (Bearer Token Required)
app.post('/tweet/:id/reply', authenticateToken, async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'This endpoint requires user authentication',
        message: 'API key is required for replying to tweets'
      });
    }

    const { id: tweetId } = req.params;
    const { text, media_ids } = req.body;
    
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Reply text is required',
        message: 'Please provide reply content in the "text" field'
      });
    }

    if (text.length > 280) {
      return res.status(400).json({
        success: false,
        error: 'Reply text too long',
        message: 'Reply must be 280 characters or less'
      });
    }

    console.log(`Replying to tweet ${tweetId}: ${text.substring(0, 50)}...`);
    
    // Prepare options for reply
    const options = {
      replyToTweetId: tweetId
    };
    
    if (media_ids && Array.isArray(media_ids) && media_ids.length > 0) {
      options.mediaIds = media_ids;
    }
    
    // Post reply using rettiwt-api
    const replyTweet = await rettiwt.tweet.post(text, options);
    
    res.json({
      success: true,
      message: 'Reply posted successfully',
      reply: {
        id: replyTweet.id,
        text: replyTweet.fullText,
        createdAt: replyTweet.createdAt,
        author: replyTweet.tweetBy?.userName || 'unknown',
        replyToTweetId: tweetId,
        likes: replyTweet.likeCount || 0,
        retweets: replyTweet.retweetCount || 0,
        replies: replyTweet.replyCount || 0,
        media: replyTweet.media?.map(m => ({
          type: m.type,
          url: m.url
        })) || []
      }
    });
    
  } catch (error) {
    console.error('Error posting reply:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to post reply',
      message: error.message,
      suggestion: 'Check the tweet ID and your reply content'
    });
  }
});

// Get trending topics (if authenticated)
app.get('/trending', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'This endpoint requires user authentication',
        message: 'API key is required for this feature'
      });
    }
    
    console.log('Fetching trending topics...');
    
    // This would require additional implementation for trending topics
    res.json({
      success: false,
      error: 'Trending topics endpoint not yet implemented',
      message: 'This feature requires additional implementation',
      note: 'You can use the search endpoint to find popular tweets instead'
    });
    
  } catch (error) {
    console.error('Error fetching trending topics:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending topics',
      message: error.message
    });
  }
});

// Delete a tweet (Bearer Token Required)
app.delete('/tweet/:id', authenticateToken, async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'This endpoint requires user authentication',
        message: 'API key is required for deleting tweets'
      });
    }

    const { id: tweetId } = req.params;
    
    console.log(`Deleting tweet with ID: ${tweetId}`);
    
    // Delete tweet using rettiwt-api
    await rettiwt.tweet.unpost(tweetId);
    
    res.json({
      success: true,
      message: 'Tweet deleted successfully',
      tweetId: tweetId
    });
    
  } catch (error) {
    console.error('Error deleting tweet:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete tweet',
      message: error.message,
      suggestion: 'Check if the tweet ID is correct and you own the tweet'
    });
  }
});

// Like a tweet (Bearer Token Required)
app.post('/tweet/:id/like', authenticateToken, async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'This endpoint requires user authentication',
        message: 'API key is required for liking tweets'
      });
    }

    const { id: tweetId } = req.params;
    
    console.log(`Liking tweet with ID: ${tweetId}`);
    
    // Like tweet using rettiwt-api
    await rettiwt.tweet.like(tweetId);
    
    res.json({
      success: true,
      message: 'Tweet liked successfully',
      tweetId: tweetId,
      action: 'liked'
    });
    
  } catch (error) {
    console.error('Error liking tweet:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to like tweet',
      message: error.message,
      suggestion: 'Check if the tweet ID is correct and exists'
    });
  }
});

// Unlike a tweet (Bearer Token Required)
app.delete('/tweet/:id/like', authenticateToken, async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'This endpoint requires user authentication',
        message: 'API key is required for unliking tweets'
      });
    }

    const { id: tweetId } = req.params;
    
    console.log(`Unliking tweet with ID: ${tweetId}`);
    
    // Unlike tweet using rettiwt-api
    await rettiwt.tweet.unlike(tweetId);
    
    res.json({
      success: true,
      message: 'Tweet unliked successfully',
      tweetId: tweetId,
      action: 'unliked'
    });
    
  } catch (error) {
    console.error('Error unliking tweet:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to unlike tweet',
      message: error.message,
      suggestion: 'Check if the tweet ID is correct and you have previously liked it'
    });
  }
});

// Retweet a tweet (Bearer Token Required)
app.post('/tweet/:id/retweet', authenticateToken, async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'This endpoint requires user authentication',
        message: 'API key is required for retweeting'
      });
    }

    const { id: tweetId } = req.params;
    
    console.log(`Retweeting tweet with ID: ${tweetId}`);
    
    // Retweet using rettiwt-api
    await rettiwt.tweet.retweet(tweetId);
    
    res.json({
      success: true,
      message: 'Tweet retweeted successfully',
      tweetId: tweetId,
      action: 'retweeted'
    });
    
  } catch (error) {
    console.error('Error retweeting tweet:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to retweet',
      message: error.message,
      suggestion: 'Check if the tweet ID is correct and exists'
    });
  }
});

// Unretweet a tweet (Bearer Token Required)
app.delete('/tweet/:id/retweet', authenticateToken, async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'This endpoint requires user authentication',
        message: 'API key is required for unretweeting'
      });
    }

    const { id: tweetId } = req.params;
    
    console.log(`Unretweeting tweet with ID: ${tweetId}`);
    
    // Unretweet using rettiwt-api
    await rettiwt.tweet.unretweet(tweetId);
    
    res.json({
      success: true,
      message: 'Tweet unretweeted successfully',
      tweetId: tweetId,
      action: 'unretweeted'
    });
    
  } catch (error) {
    console.error('Error unretweeting tweet:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to unretweet',
      message: error.message,
      suggestion: 'Check if the tweet ID is correct and you have previously retweeted it'
    });
  }
});

// Advanced search endpoint with filters
app.get('/advanced-search', async (req, res) => {
  try {
    const { 
      q: query, 
      from_user, 
      has_images, 
      has_videos, 
      count = 20 
    } = req.query;
    
    if (!query && !from_user) {
      return res.status(400).json({
        success: false,
        error: 'Either "q" (query) or "from_user" parameter is required'
      });
    }
    
    console.log(`Advanced search - Query: ${query}, From: ${from_user}`);
    
    // Build advanced search query
    const searchQuery = {};
    
    if (query) {
      searchQuery.includeWords = [query];
    }
    
    if (from_user) {
      searchQuery.fromUsers = [from_user];
    }
    
    if (has_images === 'true') {
      searchQuery.hasImages = true;
    }
    
    if (has_videos === 'true') {
      searchQuery.hasVideos = true;
    }
    
    const searchResults = await rettiwt.tweet.search(searchQuery, parseInt(count), null);
    
    res.json({
      success: true,
      query: searchQuery,
      count: searchResults?.list?.length || 0,
      tweets: searchResults?.list?.map(tweet => ({
        id: tweet.id,
        text: tweet.fullText,
        createdAt: tweet.createdAt,
        author: tweet.tweetBy?.userName || 'unknown',
        likes: tweet.likeCount || 0,
        retweets: tweet.retweetCount || 0,
        replies: tweet.replyCount || 0,
        media: tweet.media?.map(m => ({
          type: m.type,
          url: m.url
        })) || []
      })) || []
    });
    
  } catch (error) {
    console.error('Error in advanced search:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to perform advanced search',
      message: error.message
    });
  }
});

// 404 Handler - Route not found
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    suggestion: 'Check the API documentation for available endpoints',
    available_endpoints: {
      info: 'GET /',
      health: 'GET /health',
      documentation: 'See README.md for full API documentation'
    },
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const errorId = Math.random().toString(36).substr(2, 9);
  
  // Log error details
  console.error(`[${timestamp}] ERROR [${errorId}]:`, {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')
  });
  
  // Determine error type and status code
  let statusCode = err.statusCode || err.status || 500;
  let errorType = 'Internal Server Error';
  let userMessage = 'Something went wrong on our end';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorType = 'Validation Error';
    userMessage = 'Invalid input data';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorType = 'Authentication Error';
    userMessage = 'Invalid or missing authentication';
  } else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    statusCode = 503;
    errorType = 'Service Unavailable';
    userMessage = 'External service temporarily unavailable';
  } else if (err.name === 'SyntaxError' && err.message.includes('JSON')) {
    statusCode = 400;
    errorType = 'JSON Parse Error';
    userMessage = 'Invalid JSON format in request body';
  }
  
  // Response object
  const errorResponse = {
    success: false,
    error: errorType,
    message: userMessage,
    error_id: errorId,
    timestamp: timestamp
  };
  
  // Add detailed error info in development
  if (NODE_ENV === 'development') {
    errorResponse.details = {
      original_message: err.message,
      stack: err.stack,
      code: err.code
    };
  }
  
  // Add suggestions for common errors
  if (statusCode === 401) {
    errorResponse.suggestion = 'Include a valid Bearer token in the Authorization header';
    errorResponse.example = 'Authorization: Bearer your-token-here';
  } else if (statusCode === 400) {
    errorResponse.suggestion = 'Check your request format and required parameters';
  } else if (statusCode === 503) {
    errorResponse.suggestion = 'Please try again in a few moments';
  }
  
  res.status(statusCode).json(errorResponse);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  const timestamp = new Date().toISOString();
  console.log(`\n🚀 Twitter API Server Started Successfully!`);
  console.log(`📅 Timestamp: ${timestamp}`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`📱 Environment: ${NODE_ENV}`);
  console.log(`🔑 Twitter API: ${API_KEY && API_KEY !== 'API_KEY' ? '✅ Configured' : '❌ Not Configured'}`);
  console.log(`🛡️  Bearer Token: ${BEARER_TOKEN !== 'your-secure-bearer-token-here' ? '✅ Configured' : '⚠️  Default Token (Change Required)'}`);
  console.log(`🌐 Local Access: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  
  console.log('\n📋 Available Endpoints:');
  console.log('\n🔓 Public Endpoints (No Auth Required):');
  console.log('  GET / - API Information');
  console.log('  GET /health - Health Check');
  console.log('  GET /user/:username - User Tweets');
  console.log('  GET /search - Search Tweets');
  console.log('  GET /tweet/:id - Tweet Details');
  console.log('  GET /user/:username/info - User Info');
  console.log('  GET /advanced-search - Advanced Search');
  
  console.log('\n🔒 Protected Endpoints (Bearer Token Required):');
  console.log('  POST /tweet - Post Tweet');
  console.log('  POST /upload - Upload Media');
  console.log('  POST /tweet/:id/reply - Reply to Tweet');
  console.log('  DELETE /tweet/:id - Delete Tweet');
  console.log('  POST /tweet/:id/like - Like Tweet');
  console.log('  DELETE /tweet/:id/like - Unlike Tweet');
  console.log('  POST /tweet/:id/retweet - Retweet');
  console.log('  DELETE /tweet/:id/retweet - Unretweet');
  
  console.log('\n🔧 Configuration Status:');
  if (!API_KEY || API_KEY === 'API_KEY') {
    console.log('  ⚠️  Warning: Twitter API key not configured');
  }
  if (BEARER_TOKEN === 'your-secure-bearer-token-here') {
    console.log('  ⚠️  Warning: Default bearer token in use - security risk!');
  }
  
  console.log('\n✅ Server is ready to accept connections!\n');
});
