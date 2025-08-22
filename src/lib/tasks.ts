
export type Task = {
  taskTitle: string;
  taskDescription: string;
  options: string[];
};

export const taskLibrary: Task[] = [
  {
    taskTitle: "Review a local coffee shop's new seasonal drink",
    taskDescription: "Taste and rate the new 'Pumpkin Spice Cold Brew' at your neighborhood cafe.",
    options: [
        "Amazingly festive flavor!",
        "It was just okay.",
        "Too sweet for my liking.",
        "Didn't taste like pumpkin at all."
    ],
  },
  {
    taskTitle: "Rate the user interface of a popular mobile game",
    taskDescription: "Assess the layout, navigation, and overall user experience of the game 'Galaxy Raiders'.",
    options: [
        "Incredibly intuitive and fun!",
        "A bit cluttered but usable.",
        "Confusing and hard to navigate.",
        "The UI is buggy and crashes."
    ],
  },
  {
    taskTitle: "Review the plot of the latest blockbuster movie",
    taskDescription: "Watch 'Cybernetic Dawn' and give your opinion on its story, pacing, and characters.",
    options: [
        "A cinematic masterpiece!",
        "Entertaining but forgettable.",
        "The plot had too many holes.",
        "Predictable and boring."
    ],
  },
  {
    taskTitle: "Assess the quality of a new restaurant's delivery service",
    taskDescription: "Order food from 'The Gilded Spoon' and rate the packaging, delivery time, and food temperature.",
    options: [
        "Fast, hot, and perfect!",
        "Average delivery experience.",
        "Food was cold on arrival.",
        "The order was incorrect."
    ],
  },
  {
    taskTitle: "Evaluate a new productivity app's features",
    taskDescription: "Try out the 'FocusFlow' app for a day and review its effectiveness and ease of use.",
    options: [
        "Boosted my productivity!",
        "Helpful, but with a learning curve.",
        "Has potential but is buggy.",
        "More distracting than helpful."
    ]
  },
  {
    taskTitle: "Review the comfort of a new line of sneakers",
    taskDescription: "Wear the 'AeroStride 5s' for a day of walking and evaluate their comfort and support.",
    options: [
      "Like walking on clouds!",
      "Comfortable, but not for all-day wear.",
      "Caused blisters and discomfort.",
      "The sizing feels off."
    ],
  },
  {
    taskTitle: "Rate the customer service at a major electronics store",
    taskDescription: "Interact with the support staff at 'TechGiant' and assess their helpfulness and knowledge.",
    options: [
      "Excellent, friendly, and solved my issue!",
      "Polite but unable to help.",
      "Staff seemed uninterested.",
      "A very frustrating and unhelpful experience."
    ],
  },
  {
    taskTitle: "Review the battery life of a new smartphone",
    taskDescription: "Use the 'NexaPhone X' for a full day of typical activities and report on its battery performance.",
    options: [
      "Lasted all day with heavy use!",
      "Decent battery, but needed a top-up.",
      "Barely made it to the afternoon.",
      "The battery drains incredibly fast."
    ],
  },
  {
    taskTitle: "Assess the build quality of a new piece of flat-pack furniture",
    taskDescription: "Assemble the 'OakLyfe' bookshelf and evaluate the clarity of instructions and sturdiness of materials.",
    options: [
      "Easy to build and very sturdy.",
      "Instructions were confusing, but it's solid.",
      "Materials feel cheap and flimsy.",
      "Parts were missing or didn't fit."
    ],
  },
  {
    taskTitle: "Evaluate a language learning app's voice recognition",
    taskDescription: "Use the speaking exercises in 'LinguaSphere' and rate the accuracy of its voice recognition.",
    options: [
      "Understood me perfectly every time.",
      "Mostly accurate, but with some errors.",
      "Frequently misunderstood my pronunciation.",
      "The voice recognition feature is unusable."
    ],
  },
  {
    taskTitle: "Review a new fantasy novel",
    taskDescription: "Read 'The Last Dragon's Ember' and give your opinion on its world-building and character development.",
    options: [
      "A rich and immersive world I couldn't leave.",
      "An enjoyable read with a few flat characters.",
      "The world felt generic and uninspired.",
      "I couldn't connect with any of the characters."
    ],
  },
  {
    taskTitle: "Rate the effectiveness of a new brand of sunscreen",
    taskDescription: "Spend time outdoors using 'SunShield SPF 50' and assess its protection and feel on the skin.",
    options: [
      "No sunburn and feels light on the. skin.",
      "It worked, but felt greasy.",
      "Felt nice, but I still got a little burnt.",
      "Greasy, ineffective, and caused a breakout."
    ],
  },
  {
    taskTitle: "Review a dog park's amenities and cleanliness",
    taskDescription: "Visit 'The Pawsitive Place' park and evaluate its features (e.g., water stations, space) and upkeep.",
    options: [
      "Clean, spacious, and great for dogs!",
      "It's a decent park, but could be cleaner.",
      "Too small and crowded.",
      "The park was dirty and poorly maintained."
    ],
  },
  {
    taskTitle: "Assess a new brand of organic pasta",
    taskDescription: "Cook and taste 'Nonna's Harvest' organic spaghetti and review its texture and flavor.",
    options: [
      "Tastes authentic and has a perfect texture.",
      "A good alternative to regular pasta.",
      "The texture was a bit mushy.",
      "Lacked flavor and fell apart when cooked."
    ],
  },
  {
    taskTitle: "Evaluate a historical documentary series",
    taskDescription: "Watch 'Echoes of Rome' and rate its historical accuracy, narration, and engagement factor.",
    options: [
      "Fascinating, informative, and engaging!",
      "Interesting, but a bit dry at times.",
      "Felt more like entertainment than history.",
      "Contained several historical inaccuracies."
    ],
  },
  {
    taskTitle: "Review the user experience of an online banking portal",
    taskDescription: "Perform a common task (e.g., transfer funds) on 'SecureBank Online' and rate the process.",
    options: [
        "The process was simple and seamless.",
        "It worked, but took a few tries to figure out.",
        "The website was slow and confusing.",
        "I encountered an error and couldn't complete the task."
    ]
  },
  {
    taskTitle: "Rate the call quality of a new set of wireless earbuds",
    taskDescription: "Make several calls using the 'CrystalComm Buds' and assess how well the other person can hear you.",
    options: [
        "Callers said I sounded perfectly clear.",
        "My voice was clear but there was background noise.",
        "Callers said I sounded muffled and distant.",
        "The microphone quality is terrible for calls."
    ]
  },
  {
    taskTitle: "Review the flavor of a new vegan ice cream",
    taskDescription: "Taste the 'KindKreme' chocolate fudge brownie flavor and rate its taste and creaminess.",
    options: [
        "Delicious! You'd never know it's vegan.",
        "A good dairy-free option, but not my favorite.",
        "The flavor was weak and the texture was icy.",
        "It had an unpleasant aftertaste."
    ]
  },
  {
    taskTitle: "Assess the search function of a stock photo website",
    taskDescription: "Try to find a specific image (e.g., 'laughing senior couple') on 'PixaBay' and rate the relevance of the results.",
    options: [
        "Found exactly what I needed right away.",
        "It took some scrolling, but I found a good image.",
        "The search results were mostly irrelevant.",
        "The search function is frustrating to use."
    ]
  },
  {
    taskTitle: "Evaluate the brightness of a new LED headlight bulb for cars",
    taskDescription: "Install the 'LumaBright 9000' bulb and compare its brightness and visibility at night to your old bulbs.",
    options: [
        "A huge improvement! The road is so much clearer.",
        "Noticeably brighter than the stock bulbs.",
        "Only a minor improvement.",
        "I can't see a difference in brightness."
    ]
  }
];

    