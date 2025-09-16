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
const PORT = 3000;
const NODE_ENV = 'development';

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
app.use(express.json());

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
  res.json({ 
    message: 'Complete Twitter API with Rettiwt-API Integration', 
    status: 'running',
    authMode: API_KEY ? 'User Authentication (Full Access)' : 'Guest Authentication (Limited Access)',
    environment: NODE_ENV,
    endpoints: [
      'GET / - Health check and API information',
      'GET /user/:username - Get tweets from user',
      'GET /search?q=keyword - Search tweets',
      'GET /tweet/:id - Get specific tweet',
      'GET /user/:username/info - Get user information',
      'GET /trending - Trending topics (requires auth)',
      'GET /advanced-search - Advanced search with filters',
      'POST /tweet - Post a new tweet (requires auth)',
      'POST /upload - Upload media for tweets (requires auth)',
      'POST /tweet/:id/reply - Reply to a tweet (requires auth)',
      'DELETE /tweet/:id - Delete a tweet (requires auth)',
      'POST /tweet/:id/like - Like a tweet (requires auth)',
      'DELETE /tweet/:id/like - Unlike a tweet (requires auth)',
      'POST /tweet/:id/retweet - Retweet a tweet (requires auth)',
      'DELETE /tweet/:id/retweet - Unretweet a tweet (requires auth)'
    ],
    examples: [
      `http://localhost:${PORT}/user/elonmusk`,
      `http://localhost:${PORT}/search?q=javascript`,
      `http://localhost:${PORT}/user/elonmusk/info`,
      `http://localhost:${PORT}/tweet/1234567890123456789`
    ]
  });
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /',
      'GET /user/:username',
      'GET /search?q=keyword',
      'GET /tweet/:id',
      'GET /user/:username/info',
      'GET /trending',
      'GET /advanced-search'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Complete Twitter API Server running on port ${PORT}`);
  console.log(`📡 Authentication: ${API_KEY ? 'User (Full Access)' : 'Guest (Limited Access)'}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`  - GET / (health check & API info)`);
  console.log(`  - GET /user/:username (get user tweets)`);
  console.log(`  - GET /search?q=keyword (search tweets)`);
  console.log(`  - GET /tweet/:id (get specific tweet)`);
  console.log(`  - GET /user/:username/info (get user information)`);
  console.log(`  - GET /trending (trending topics - requires auth)`);
  console.log(`  - GET /advanced-search (advanced search with filters)`);
  console.log(`  - POST /tweet (post new tweet - requires auth)`);
  console.log(`  - POST /upload (upload media - requires auth)`);
  console.log(`  - POST /tweet/:id/reply (reply to tweet - requires auth)`);
  console.log(`  - DELETE /tweet/:id (delete tweet - requires auth)`);
  console.log(`  - POST /tweet/:id/like (like tweet - requires auth)`);
  console.log(`  - DELETE /tweet/:id/like (unlike tweet - requires auth)`);
  console.log(`  - POST /tweet/:id/retweet (retweet - requires auth)`);
  console.log(`  - DELETE /tweet/:id/retweet (unretweet - requires auth)`);
  console.log(`\n🔗 Example usage:`);
  console.log(`  - http://localhost:${PORT}/user/elonmusk`);
  console.log(`  - http://localhost:${PORT}/search?q=javascript`);
  console.log(`  - http://localhost:${PORT}/user/elonmusk/info`);
  console.log(`  - http://localhost:${PORT}/tweet/1234567890123456789`);
  console.log(`  - http://localhost:${PORT}/advanced-search?q=bitcoin&has_images=true`);
  
  if (API_KEY) {
    console.log(`\n✅ API Key configured - Full access enabled!`);
  } else {
    console.log(`\n⚠️  No API Key - Using guest mode (limited access)`);
  }
  
  console.log(`\n🔧 Configuration:`);
  console.log(`  - Rate Limit: ${RATE_LIMIT_MAX} requests per ${RATE_LIMIT_WINDOW} minutes`);
  console.log(`  - Log Level: ${LOG_LEVEL}`);
});
