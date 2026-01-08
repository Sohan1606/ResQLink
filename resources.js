// 🚨 ResQLink Classifieds - API Resources Configuration
// California Cities from your attachment + National coverage

const RESOURCES = {
  // 🏠 Listings (Main Classifieds)
  listings: {
    model: 'Listing',
    routes: ['/api/listings'],
    operations: ['create', 'read', 'update', 'delete', 'query'],
    maxPerUser: process.env.MAX_LISTINGS_PER_USER || 10,
    maxImages: 8,
    categories: [
      'for-sale', 'housing', 'jobs', 'services', 'gigs', 
      'community', 'resumes', 'free'
    ],
    californiaCities: [
      'bakersfield', 'chico', 'fresno', 'humboldt', 'imperial',
      'inland-empire', 'long-beach', 'los-angeles', 'mendocino',
      'merced', 'modesto', 'monterey', 'north-bay', 'oakland',
      'orange-county', 'palm-springs', 'palmdale', 'redding',
      'sacramento', 'san-diego', 'san-fernando-valley', 
      'san-francisco', 'san-gabriel-valley', 'san-jose',
      'san-luis-obispo', 'san-mateo', 'santa-barbara',
      'santa-cruz', 'santa-maria', 'siskiyou', 'stockton',
      'susanville', 'ventura', 'visalia'
    ]
  },

  // 👥 Users
  users: {
    model: 'User',
    routes: ['/api/users', '/api/auth'],
    operations: ['create', 'read', 'update'],
    fields: {
      public: ['id', 'username', 'email', 'location', 'createdAt'],
      private: ['password', 'emailVerified', 'phone']
    }
  },

  // 💬 Messages
  messages: {
    model: 'Message',
    routes: ['/api/messages'],
    operations: ['create', 'read', 'query']
  },

  // 🖼️ Images
  images: {
    model: 'Image',
    routes: ['/api/images'],
    operations: ['create', 'read', 'delete'],
    maxSize: 5242880, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
  },

  // 🌍 Categories
  categories: {
    model: 'Category',
    routes: ['/api/categories'],
    operations: ['read', 'query']
  }
};

// Utility functions
module.exports = {
  RESOURCES,
  getResourceConfig: (resourceName) => RESOURCES[resourceName],
  isValidCity: (city) => RESOURCES.listings.californiaCities.includes(city?.toLowerCase()),
  getValidCities: () => RESOURCES.listings.californiaCities,
  getListingCategories: () => RESOURCES.listings.categories,
  validateListing: (data) => {
    const config = RESOURCES.listings;
    return {
      validCity: config.californiaCities.includes(data.city?.toLowerCase()),
      validCategory: config.categories.includes(data.category?.toLowerCase()),
      maxImages: data.images?.length <= config.maxImages
    };
  }
};
