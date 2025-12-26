// lib/princetonDates.js

export const princetonDates = [
  // FOOD/DINING
  {
    id: 1,
    name: "Hoagie Haven late night",
    description: "Classic Princeton move - grab hoagies late night and walk around campus",
    category: "food",
    subcategory: "casual",
    vibes: ["casual", "social", "late-night"],
    cost: "cheap",
    season: "any"
  },
  {
    id: 2,
    name: "Small World Coffee",
    description: "Cozy café on Witherspoon or Nassau - perfect for good conversation",
    category: "food",
    subcategory: "casual",
    vibes: ["intellectual", "casual", "coffee"],
    cost: "cheap",
    season: "any"
  },
  {
    id: 3,
    name: "The Bent Spoon",
    description: "Local artisan ice cream on Palmer Square - sweet treat and walk",
    category: "food",
    subcategory: "casual",
    vibes: ["casual", "sweet", "social"],
    cost: "cheap",
    season: "any"
  },
  {
    id: 4,
    name: "Thomas Sweet",
    description: "Princeton institution since 1979 - ice cream and candy",
    category: "food",
    subcategory: "casual",
    vibes: ["casual", "sweet", "classic"],
    cost: "cheap",
    season: "any"
  },
  {
    id: 5,
    name: "Frist late meal",
    description: "Grab late meal at Frist and find a cozy spot to chat",
    category: "food",
    subcategory: "casual",
    vibes: ["casual", "convenient", "social"],
    cost: "free",
    season: "any"
  },
  {
    id: 6,
    name: "Baking in dorm kitchen",
    description: "Get ingredients and bake together - fun and delicious",
    category: "food",
    subcategory: "active",
    vibes: ["cooking", "baking", "creative", "cozy"],
    cost: "cheap",
    season: "any"
  },
  {
    id: 7,
    name: "Studio 34",
    description: "Grab food at Studio 34 after class or practice - casual and convenient",
    category: "food",
    subcategory: "casual",
    vibes: ["casual", "convenient"],
    cost: "free",
    season: "any"
  },
  {
    id: 8,
    name: "Kung Fu Tea",
    description: "Get boba and walk around Nassau Street or campus",
    category: "food",
    subcategory: "casual",
    vibes: ["casual", "social", "boba"],
    cost: "cheap",
    season: "any"
  },
  {
    id: 9,
    name: "MTea",
    description: "Milk tea and studying - productive and tasty",
    category: "food",
    subcategory: "casual",
    vibes: ["casual", "studying", "productive"],
    cost: "cheap",
    season: "any"
  },
  {
    id: 10,
    name: "Mamoun's Falafel",
    description: "Late night Mamoun's run - Princeton student staple",
    category: "food",
    subcategory: "casual",
    vibes: ["casual", "late-night", "social"],
    cost: "cheap",
    season: "any"
  },
  {
    id: 11,
    name: "Junbi Ramen",
    description: "Warm ramen and good conversation - cozy spot near campus",
    category: "food",
    subcategory: "casual",
    vibes: ["casual", "cozy", "foodie"],
    cost: "medium",
    season: "any"
  },
  {
    id: 12,
    name: "Jules Thin Crust",
    description: "Local pizza joint - casual and delicious",
    category: "food",
    subcategory: "casual",
    vibes: ["casual", "social", "pizza"],
    cost: "cheap",
    season: "any"
  },

  // OUTDOOR/ACTIVE
  {
    id: 13,
    name: "Lake Carnegie walk",
    description: "Beautiful walk around the lake - great for long conversations",
    category: "outdoor",
    subcategory: "active",
    vibes: ["nature", "walking", "scenic", "peaceful"],
    cost: "free",
    season: "spring/fall"
  },
  {
    id: 14,
    name: "Towpath bike ride",
    description: "Scenic bike ride along the canal towpath",
    category: "outdoor",
    subcategory: "active",
    vibes: ["exercise", "outdoorsy", "adventure", "biking"],
    cost: "free",
    season: "spring/fall"
  },
  {
    id: 15,
    name: "Cannon Green picnic",
    description: "Grab food and have a picnic on the lawn - classic Princeton date",
    category: "outdoor",
    subcategory: "casual",
    vibes: ["casual", "nature", "relaxing", "picnic"],
    cost: "cheap",
    season: "spring/fall"
  },
  {
    id: 16,
    name: "Campus sunset watching",
    description: "Watch sunset from a scenic campus location - romantic and free",
    category: "outdoor",
    subcategory: "romantic",
    vibes: ["romantic", "nature", "photography", "peaceful"],
    cost: "free",
    season: "any"
  },
  {
    id: 17,
    name: "Stargazing on campus",
    description: "Find a dark spot and look at stars - bring a blanket",
    category: "outdoor",
    subcategory: "romantic",
    vibes: ["stargazing", "romantic", "science", "peaceful"],
    cost: "free",
    season: "any"
  },
  {
    id: 18,
    name: "Princeton Cemetery walk",
    description: "Historic cemetery walk - interesting if you're into history",
    category: "outdoor",
    subcategory: "cultural",
    vibes: ["history", "walking", "culture", "peaceful"],
    cost: "free",
    season: "any"
  },
  {
    id: 19,
    name: "Graduate College exploration",
    description: "Check out the impressive Grad College architecture and grounds",
    category: "outdoor",
    subcategory: "cultural",
    vibes: ["architecture", "walking", "culture", "exploring"],
    cost: "free",
    season: "any"
  },
  {
    id: 20,
    name: "Baker Rink ice skating",
    description: "Ice skating together - fun winter activity on campus",
    category: "outdoor",
    subcategory: "active",
    vibes: ["ice-skating", "sports", "winter", "playful"],
    cost: "cheap",
    season: "winter"
  },

  // CULTURAL/INTELLECTUAL
  {
    id: 21,
    name: "Princeton Art Museum",
    description: "Free museum with great collections - walk and discuss art",
    category: "cultural",
    subcategory: "intellectual",
    vibes: ["art", "culture", "museums", "intellectual"],
    cost: "free",
    season: "any"
  },
  {
    id: 22,
    name: "McCarter Theatre",
    description: "Catch a show at McCarter - student tickets often available",
    category: "cultural",
    subcategory: "entertainment",
    vibes: ["theater", "culture", "arts", "performance"],
    cost: "medium",
    season: "any"
  },
  {
    id: 23,
    name: "Garden Theatre movie",
    description: "Independent cinema on Nassau Street - more interesting than mainstream",
    category: "cultural",
    subcategory: "entertainment",
    vibes: ["movies", "film", "culture", "indie"],
    cost: "cheap",
    season: "any"
  },
  {
    id: 24,
    name: "Firestone Library study date",
    description: "Study together in beautiful library setting - productive and cozy",
    category: "cultural",
    subcategory: "academic",
    vibes: ["studying", "reading", "academic", "productive"],
    cost: "free",
    season: "any"
  },
  {
    id: 25,
    name: "A cappella concert",
    description: "Princeton has great a cappella groups - fun evening show",
    category: "cultural",
    subcategory: "entertainment",
    vibes: ["music", "performance", "culture", "singing"],
    cost: "free",
    season: "any"
  },
  {
    id: 26,
    name: "Princeton sports game",
    description: "Basketball, hockey, or other sport - school spirit and fun",
    category: "cultural",
    subcategory: "sports",
    vibes: ["sports", "social", "school-spirit", "energetic"],
    cost: "free",
    season: "winter/spring"
  },
  {
    id: 27,
    name: "Student theater production",
    description: "Support student theater - usually interesting and impressive",
    category: "cultural",
    subcategory: "entertainment",
    vibes: ["theater", "culture", "arts", "performance"],
    cost: "cheap",
    season: "any"
  },
  {
    id: 28,
    name: "Labyrinth Books",
    description: "Browse the indie bookstore, recommend books to each other",
    category: "cultural",
    subcategory: "casual",
    vibes: ["reading", "books", "intellectual", "cozy"],
    cost: "free",
    season: "any"
  },
  {
    id: 29,
    name: "Princeton Record Exchange",
    description: "Dig through vinyl and CDs - fun if you're into music",
    category: "cultural",
    subcategory: "casual",
    vibes: ["music", "culture", "vintage", "exploring"],
    cost: "free",
    season: "any"
  },

  // CAMPUS CASUAL
  {
    id: 30,
    name: "Coffee Club",
    description: "Campus coffee shop - study together or just hang",
    category: "casual",
    subcategory: "academic",
    vibes: ["studying", "coffee", "casual", "productive"],
    cost: "free",
    season: "any"
  },
  {
    id: 31,
    name: "Frist Campus Center hang",
    description: "Meet at Frist, grab food, find comfy spot to talk",
    category: "casual",
    subcategory: "social",
    vibes: ["casual", "social", "convenient"],
    cost: "free",
    season: "any"
  },
  {
    id: 32,
    name: "Princeton climbing gym",
    description: "Indoor climbing together - active and fun challenge",
    category: "casual",
    subcategory: "active",
    vibes: ["climbing", "exercise", "sports", "challenge"],
    cost: "cheap",
    season: "any"
  },
  {
    id: 33,
    name: "Nassau Street stroll",
    description: "Walk down Nassau, check out shops, grab coffee or food",
    category: "casual",
    subcategory: "social",
    vibes: ["casual", "social", "walking", "exploring"],
    cost: "free",
    season: "any"
  },
  {
    id: 34,
    name: "Palmer Square",
    description: "Meet at the fountain, then explore the area",
    category: "casual",
    subcategory: "social",
    vibes: ["casual", "social", "central"],
    cost: "free",
    season: "any"
  },

  // SLIGHTLY FURTHER
  {
    id: 35,
    name: "AMC Marketfair movie",
    description: "Catch a movie at the nearby theater - need ride or bus",
    category: "entertainment",
    subcategory: "movie",
    vibes: ["movies", "entertainment", "classic-date"],
    cost: "medium",
    season: "any"
  },
  {
    id: 36,
    name: "Grounds for Sculpture",
    description: "Amazing sculpture park in Hamilton - need car but worth it",
    category: "cultural",
    subcategory: "outdoor",
    vibes: ["art", "sculpture", "outdoorsy", "photography", "adventure"],
    cost: "medium",
    season: "spring/fall"
  }
]

// Hobby to vibe mapping
export const hobbyVibeMap = {
  "Traveling": ["adventure", "exploring", "outdoorsy"],
  "Exercise": ["exercise", "sports", "active"],
  "Photography": ["photography", "art", "nature", "outdoorsy"],
  "Cooking": ["cooking", "foodie"],
  "Dancing": ["dancing", "music", "energetic"],
  "Hiking": ["outdoorsy", "nature", "walking", "adventure"],
  "Attending concerts": ["music", "culture", "performance"],
  "Painting/Drawing": ["art", "creative", "culture"],
  "Yoga": ["exercise", "peaceful", "wellness"],
  "Playing sports": ["sports", "active", "competitive"],
  "Reading": ["reading", "intellectual", "books", "cozy"],
  "Volunteer/Charity work": ["community", "meaningful"],
  "Watching movies/shows": ["movies", "entertainment", "cozy"],
  "Anime": ["culture", "entertainment", "casual"],
  "Art appreciation": ["art", "culture", "museums"],
  "Learning languages": ["intellectual", "culture", "academic"],
  "Board/Card games": ["games", "social", "casual"],
  "Crafting": ["creative", "cozy", "art"],
  "Running": ["exercise", "outdoorsy", "active"],
  "Reading the news": ["intellectual", "current-events"],
  "Stargazing": ["stargazing", "science", "romantic", "peaceful"],
  "Comedy": ["comedy", "entertainment", "social"],
  "Partying": ["social", "energetic", "late-night"],
  "Coding": ["intellectual", "academic", "casual"],
  "Baking": ["baking", "cooking", "creative", "cozy"],
  "Singing": ["music", "performance", "creative"]
}