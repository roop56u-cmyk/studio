
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
  },
  {
    taskTitle: "Review a podcast on historical events",
    taskDescription: "Listen to an episode of 'Time Travelers' and rate its storytelling and factual accuracy.",
    options: [
      "Captivating and well-researched!",
      "Interesting but the host was a bit dry.",
      "The facts seemed a little shaky.",
      "Couldn't get through the episode."
    ]
  },
  {
    taskTitle: "Rate a food delivery app's estimated time of arrival",
    taskDescription: "Check if your order from 'Quick Eats' arrives within the promised delivery window.",
    options: [
      "It arrived earlier than expected!",
      "The ETA was accurate.",
      "It was significantly late.",
      "The app's tracking was inaccurate."
    ]
  },
  {
    taskTitle: "Assess the quality of a museum's virtual tour",
    taskDescription: "Take the online tour of the 'National Art Gallery' and evaluate the image quality and navigation.",
    options: [
      "Felt like I was actually there!",
      "A good way to see art, but some images were low-res.",
      "The controls were clunky and difficult to use.",
      "The virtual tour kept crashing."
    ]
  },
  {
    taskTitle: "Review a new flavor of sparkling water",
    taskDescription: "Taste 'Bubbly's' new Dragon Fruit flavor and rate its taste and carbonation level.",
    options: [
      "My new favorite flavor!",
      "It has a pleasant, subtle taste.",
      "Tasted artificial and too sweet.",
      "It was completely flat."
    ]
  },
  {
    taskTitle: "Evaluate a video conferencing software's background noise suppression",
    taskDescription: "Use 'ConnectSphere' for a meeting in a noisy environment and ask others how you sound.",
    options: [
      "They couldn't hear any background noise at all.",
      "It reduced the noise, but some still came through.",
      "The noise suppression made my voice sound robotic.",
      "It didn't seem to suppress any noise."
    ]
  },
  {
    taskTitle: "Review the durability of a new yoga mat",
    taskDescription: "Use the 'ZenFlow' mat for a week and assess its grip and resistance to wear.",
    options: [
      "Excellent grip and shows no wear.",
      "Good grip, but it's starting to show some marks.",
      "Slippery when I started to sweat.",
      "It started to tear after a few sessions."
    ]
  },
  {
    taskTitle: "Rate a local library's online book reservation system",
    taskDescription: "Try to reserve a book for pickup using your library's website and evaluate the process.",
    options: [
      "Simple, fast, and I got a notification right away.",
      "The process worked, but the website was slow.",
      "I couldn't find the book I was looking for.",
      "The reservation system is confusing and buggy."
    ]
  },
  {
    taskTitle: "Assess the picture quality of a new streaming service",
    taskDescription: "Watch a 4K movie on 'CineStream' and evaluate its visual fidelity and buffering.",
    options: [
      "Stunning 4K quality with no buffering.",
      "Good quality, but it buffered a few times.",
      "The picture was often pixelated.",
      "Unwatchable due to constant buffering."
    ]
  },
  {
    taskTitle: "Review a new type of reusable food wrap",
    taskDescription: "Use the 'BeeCo' wrap to store different foods and assess how well it seals and cleans.",
    options: [
      "A great eco-friendly alternative that works well.",
      "It works for some foods but not others.",
      "It doesn't create a very good seal.",
      "It's difficult to clean and retains odors."
    ]
  },
  {
    taskTitle: "Evaluate a weather app's prediction accuracy",
    taskDescription: "Compare the forecast from 'AtmoSphere' with the actual weather for three days.",
    options: [
      "The predictions were spot-on every day.",
      "It was accurate most of the time.",
      "The temperature was right, but the rain forecast was wrong.",
      "The forecast was consistently incorrect."
    ]
  },
  {
    taskTitle: "Review a new recipe from a popular cooking blog",
    taskDescription: "Make the 'One-Pan Lemon Chicken' from 'FoodieFun' and rate the instructions and final taste.",
    options: [
      "Delicious and easy to make!",
      "The recipe was good, but the instructions were unclear.",
      "It turned out okay, but I had to make adjustments.",
      "The recipe was a complete failure."
    ]
  },
  {
    taskTitle: "Rate the comfort of a new gaming chair",
    taskDescription: "Sit in the 'OmegaRacer' for a long gaming session and evaluate its ergonomics and support.",
    options: [
      "Extremely comfortable, even after hours.",
      "Comfortable for a while, but lacks lumbar support.",
      "The armrests are not adjustable enough.",
      "I felt back pain after just one hour."
    ]
  },
  {
    taskTitle: "Assess a public park's restroom cleanliness",
    taskDescription: "Visit the facilities at 'Green Valley Park' and rate them on cleanliness and supplies.",
    options: [
      "Surprisingly clean and well-stocked.",
      "Acceptable, but could use more attention.",
      "The bathroom was messy and unpleasant.",
      "Completely unusable and unsanitary."
    ]
  },
  {
    taskTitle: "Review a new brand of noise-cancelling headphones",
    taskDescription: "Test the 'Silentium' headphones on a busy street and rate their noise-cancellation effectiveness.",
    options: [
      "It blocked out almost all the noise.",
      "Good noise-cancellation for low sounds, but not high ones.",
      "I could still hear most things clearly.",
      "The noise-cancellation feature made no difference."
    ]
  },
  {
    taskTitle: "Evaluate the user-friendliness of a new smart thermostat",
    taskDescription: "Install and set up the 'EcoTemp 5' thermostat and rate the ease of installation and scheduling.",
    options: [
      "Setup was a breeze and the app is intuitive.",
      "Hardware was easy, but the software is confusing.",
      "I had to call customer support to get it working.",
      "The installation was a nightmare."
    ]
  },
  {
    taskTitle: "Review a new sci-fi TV series",
    taskDescription: "Watch the first three episodes of 'Nebula's End' and rate the plot, special effects, and acting.",
    options: [
      "Hooked! The story and visuals are amazing.",
      "A promising start, but the acting is a bit stiff.",
      "Cool special effects, but the plot is weak.",
      "I couldn't get into it at all."
    ]
  },
  {
    taskTitle: "Rate the quality of a grocery store's fresh produce",
    taskDescription: "Buy fruits and vegetables from 'FarmFresh Market' and assess their freshness and quality.",
    options: [
      "Everything was incredibly fresh and delicious.",
      "Most items were good, but some were bruised.",
      "The produce looked old and wilted.",
      "I had to throw some items out the next day."
    ]
  },
  {
    taskTitle: "Assess a new car's automated parking feature",
    taskDescription: "Try the self-parking feature on the 'Autonoma 2024' in various situations and rate its reliability.",
    options: [
      "It parked perfectly every single time.",
      "It works in simple situations but struggles with tight spots.",
      "It's too slow and I could park faster myself.",
      "The feature is unreliable and I don't trust it."
    ]
  },
  {
    taskTitle: "Review a new line of scented candles",
    taskDescription: "Burn the 'AuraScents' lavender candle and evaluate the scent strength and evenness of the burn.",
    options: [
      "Fills the room with a lovely, natural scent.",
      "The scent is nice but very subtle.",
      "It burns unevenly and creates a tunnel.",
      "The candle has almost no scent when lit."
    ]
  },
  {
    taskTitle: "Evaluate a travel booking website's price comparison tool",
    taskDescription: "Search for a flight on 'SkyScanner' and compare its prices with other sites for the same flight.",
    options: [
      "It found me the cheapest price available.",
      "The prices were competitive but not the absolute lowest.",
      "It was missing several budget airline options.",
      "The prices shown were inaccurate."
    ]
  },
  {
    taskTitle: "Review the quality of a fast-food chain's new burger",
    taskDescription: "Try the 'MegaMelt' burger from 'BurgerBlast' and rate its taste and ingredients.",
    options: [
      "A delicious, high-quality fast-food burger.",
      "It was decent, but nothing special.",
      "The patty was dry and the toppings were sparse.",
      "It tasted processed and artificial."
    ]
  },
  {
    taskTitle: "Rate the charging speed of a new power bank",
    taskDescription: "Charge your phone from 20% to 100% with the 'JuiceUp 10K' and time how long it takes.",
    options: [
      "Incredibly fast, it charged my phone in no time.",
      "The charging speed was average, as expected.",
      "It seemed slower than my regular wall charger.",
      "The power bank itself takes forever to recharge."
    ]
  },
  {
    taskTitle: "Assess the customer support of an online clothing store",
    taskDescription: "Use the live chat feature on 'StyleNow' to ask a question and rate the response time and helpfulness.",
    options: [
      "Quick, friendly, and resolved my query instantly.",
      "It took a while to connect, but they were helpful.",
      "The support agent seemed like a bot and wasn't helpful.",
      "I never got connected to a support agent."
    ]
  },
  {
    taskTitle: "Review a new brand of eco-friendly laundry detergent",
    taskDescription: "Wash a load of clothes with 'EarthSuds' and evaluate its cleaning power and scent.",
    options: [
      "My clothes are clean, fresh, and it's good for the planet!",
      "It cleaned well, but I'm not a fan of the scent.",
      "It didn't remove some of the tougher stains.",
      "My clothes didn't feel clean after washing."
    ]
  },
  {
    taskTitle: "Evaluate a music streaming service's discovery playlist",
    taskDescription: "Listen to the 'Discover Weekly' playlist on 'Tuneify' and rate how well it matches your music taste.",
    options: [
      "It's like it read my mind! Found so many new favorites.",
      "A good mix of hits and misses.",
      "Most of the songs were not to my taste.",
      "The playlist was completely random and generic."
    ]
  },
  {
    taskTitle: "Review a new true-crime documentary",
    taskDescription: "Watch 'The Maple Creek Mystery' and rate its pacing, investigation details, and conclusion.",
    options: [
      "A gripping and well-told investigation.",
      "Interesting case, but the storytelling was slow.",
      "It left too many questions unanswered.",
      "The documentary was biased and one-sided."
    ]
  },
  {
    taskTitle: "Rate a local gym's equipment and cleanliness",
    taskDescription: "Workout at 'Flex Fitness' and assess the variety of machines, their condition, and the overall hygiene.",
    options: [
      "Top-notch equipment and spotless facilities.",
      "Has everything I need, but some machines are old.",
      "The gym was crowded and I had to wait for equipment.",
      "The equipment was dirty and poorly maintained."
    ]
  },
  {
    taskTitle: "Assess the readability of a financial news website",
    taskDescription: "Read an article on 'MarketWatch' and evaluate its clarity and use of jargon.",
    options: [
      "Complex topics explained in a simple, clear way.",
      "Informative, but I had to look up some terms.",
      "The article was full of confusing financial jargon.",
      "Poorly written and hard to follow."
    ]
  },
  {
    taskTitle: "Review a new board game",
    taskDescription: "Play 'Cosmic Colonies' with friends and rate its rules, gameplay, and replay value.",
    options: [
      "An instant classic! Fun, strategic, and always different.",
      "Fun for a few plays, but might get old fast.",
      "The rules were overly complicated and confusing.",
      "The game was unbalanced and not fun."
    ]
  },
  {
    taskTitle: "Evaluate the performance of a new web browser",
    taskDescription: "Use 'Photon Browser' for a day and assess its speed, memory usage, and compatibility.",
    options: [
      "Faster and uses less memory than my old browser.",
      "Speed is good, but some websites didn't load correctly.",
      "It felt sluggish and used a lot of RAM.",
      "The browser crashed multiple times."
    ]
  },
  {
    taskTitle: "Review a new flavor of protein bar",
    taskDescription: "Taste the 'Gains' Peanut Butter Chocolate bar and rate its flavor, texture, and ingredients.",
    options: [
      "Delicious and packed with protein!",
      "The flavor is good, but the texture is chalky.",
      "It has a strong artificial sweetener aftertaste.",
      "Tastes like cardboard and is hard to chew."
    ]
  },
  {
    taskTitle: "Rate a city's public transportation mobile app",
    taskDescription: "Use your city's bus/train app to plan a trip and check real-time arrivals.",
    options: [
      "The app is user-friendly and the real-time data is accurate.",
      "It's functional but the UI could be improved.",
      "The real-time tracking is often incorrect.",
      "The app is slow, buggy, and unreliable."
    ]
  },
  {
    taskTitle: "Assess a new hair styling product",
    taskDescription: "Use the 'StyleHold' pomade and evaluate its hold, finish, and how easily it washes out.",
    options: [
      "Perfect hold, great look, and washes out easily.",
      "The hold is good, but it leaves my hair feeling greasy.",
      "The hold doesn't last throughout the day.",
      "It's sticky, heavy, and difficult to wash out."
    ]
  },
  {
    taskTitle: "Review a children's animated movie",
    taskDescription: "Watch 'The Magical Forest Friends' and rate its story, animation style, and suitability for kids.",
    options: [
      "A heartwarming story with beautiful animation.",
      "Kids will love it, but the plot is simple for adults.",
      "The humor might be inappropriate for young children.",
      "Boring and uninspired, even for kids."
    ]
  },
  {
    taskTitle: "Evaluate the 'Do Not Disturb' mode on a smartphone",
    taskDescription: "Configure and test your phone's 'Do Not Disturb' feature to see if it correctly blocks notifications.",
    options: [
      "It worked perfectly and only let my priority contacts through.",
      "It blocked most notifications, but some still came through.",
      "The settings were confusing and hard to configure.",
      "It didn't block any notifications at all."
    ]
  },
  {
    taskTitle: "Review a guided meditation app session",
    taskDescription: "Complete a 10-minute mindfulness session on 'Calm' and rate the guide's voice and the session's effectiveness.",
    options: [
      "I feel so relaxed and centered.",
      "It was a nice break, but I struggled to focus.",
      "The guide's voice was distracting.",
      "The session did not help me relax."
    ]
  },
  {
    taskTitle: "Rate the quality of a print-on-demand t-shirt",
    taskDescription: "Order a t-shirt from 'Redbubble' and assess the print quality and garment material after one wash.",
    options: [
      "The print is sharp and the shirt is soft, even after washing.",
      "The shirt is good, but the print faded slightly.",
      "The t-shirt material feels thin and cheap.",
      "The print started cracking and peeling after one wash."
    ]
  },
  {
    taskTitle: "Assess a new brand of cat litter",
    taskDescription: "Use 'ClumpMaster 3000' in your cat's litter box for a week and evaluate its clumping and odor control.",
    options: [
      "Excellent clumping and no odor!",
      "It clumps well, but odor control could be better.",
      "The clumps fall apart easily.",
      "It does a poor job of controlling odor."
    ]
  },
  {
    taskTitle: "Review an online course on digital marketing",
    taskDescription: "Take a module from a 'Coursera' course and rate the content, instructor, and learning platform.",
    options: [
      "Incredibly informative and well-structured.",
      "The content was good, but the instructor was unengaging.",
      "The information felt outdated.",
      "The platform was buggy and difficult to use."
    ]
  },
  {
    taskTitle: "Evaluate a new electric toothbrush",
    taskDescription: "Use the 'SonicClean Pro' for a week and assess its cleaning power and battery life.",
    options: [
      "My teeth have never felt cleaner.",
      "It cleans well, but the battery needs frequent charging.",
      "The bristles are too hard on my gums.",
      "It doesn't feel any more effective than a manual brush."
    ]
  },
  {
    taskTitle: "Review a coffee subscription box",
    taskDescription: "Try the coffees from 'Atlas Coffee Club' and rate the variety, freshness, and information provided.",
    options: [
      "A fantastic journey of flavors from around the world.",
      "Good variety, but one of the coffees tasted stale.",
      "I received the same type of coffee multiple times.",
      "The subscription is not worth the price."
    ]
  },
  {
    taskTitle: "Rate a car rental company's pickup process",
    taskDescription: "Rent a car from 'Hertz' and evaluate the speed, efficiency, and customer service at the pickup counter.",
    options: [
      "The process was fast, efficient, and friendly.",
      "There was a long wait, but the staff was helpful.",
      "They tried to upsell me on many unnecessary extras.",
      "The car was not ready and the process was a mess."
    ]
  },
  {
    taskTitle: "Assess the accuracy of a voice assistant",
    taskDescription: "Ask 'Google Assistant' or 'Siri' five complex questions and rate the accuracy of the answers.",
    options: [
      "It answered every question perfectly.",
      "It got most of them right, but misinterpreted one.",
      "It struggled to understand my questions.",
      "The answers were mostly irrelevant or incorrect."
    ]
  },
  {
    taskTitle: "Review a new type of office chair",
    taskDescription: "Use the 'ErgoFlex 5000' for a full workday and evaluate its comfort and adjustability.",
    options: [
      "Amazing support, I feel great after a long day.",
      "It's comfortable, but I wish it had more adjustments.",
      "The seat cushion is too firm for me.",
      "My back hurts more than with my old chair."
    ]
  },
  {
    taskTitle: "Evaluate a plant identification app",
    taskDescription: "Use 'PictureThis' to identify three different plants and rate the accuracy of the identification.",
    options: [
      "It correctly identified all three plants instantly.",
      "It got two right, but misidentified one.",
      "It struggled to identify the plants from my photos.",
      "The app provided incorrect information for all plants."
    ]
  },
  {
    taskTitle: "Review a new set of kitchen knives",
    taskDescription: "Use the 'BladeMaster' chef's knife to prep vegetables and rate its sharpness and handling.",
    options: [
      "Cuts through everything like butter, great balance.",
      "It's sharp, but the handle is a bit uncomfortable.",
      "The knife felt dull right out of the box.",
      "The blade chipped after just a few uses."
    ]
  },
  {
    taskTitle: "Rate a hotel's breakfast buffet",
    taskDescription: "Try the breakfast at a 'Hilton' hotel and evaluate the variety, quality, and freshness of the food.",
    options: [
      "A delicious and extensive selection of high-quality food.",
      "Good variety, but some hot items were cold.",
      "The selection was very limited.",
      "The food was bland and seemed old."
    ]
  },
  {
    taskTitle: "Assess the mobile ordering app for a fast-food restaurant",
    taskDescription: "Use the 'McDonald's' app to order and pay for a meal and rate the ease of use.",
    options: [
      "The app is seamless and my order was ready on arrival.",
      "The app is a bit clunky but I managed to order.",
      "I had trouble applying a discount code in the app.",
      "The app crashed and I had to order at the counter."
    ]
  },
  {
    taskTitle: "Review a new virtual reality game",
    taskDescription: "Play 'Aetheria VR' for an hour and rate its immersiveness, controls, and potential for motion sickness.",
    options: [
      "A breathtaking experience, I totally forgot the real world.",
      "Fun and immersive, but the controls are tricky.",
      "The graphics are good, but it made me feel nauseous.",
      "The game is buggy and constantly breaks immersion."
    ]
  },
  {
    taskTitle: "Evaluate a clothing rental service",
    taskDescription: "Rent an outfit from 'Rent the Runway' and assess the item's condition, fit, and the return process.",
    options: [
      "The outfit was in perfect condition and the process was easy.",
      "The item showed some minor wear and tear.",
      "The fit was not as described on the website.",
      "The return process was complicated and inconvenient."
    ]
  },
  {
    taskTitle: "Review a new flavor of potato chips",
    taskDescription: "Taste the new 'Lay's' Spicy Dill Pickle flavor and rate its flavor accuracy and crunchiness.",
    options: [
      "A perfect, bold flavor combination!",
      "Interesting flavor, but a bit too salty.",
      "It doesn't really taste like dill pickle.",
      "The chips were stale."
    ]
  },
  {
    taskTitle: "Rate an airline's in-flight entertainment system",
    taskDescription: "On a 'Delta' flight, browse the movie selection and test the responsiveness of the touch screen.",
    options: [
      "A huge selection of new movies and a responsive screen.",
      "Good selection, but the screen was laggy.",
      "The movie selection was old and limited.",
      "The system didn't work at all."
    ]
  },
  {
    taskTitle: "Assess the user interface of a smart TV",
    taskDescription: "Navigate the menus and apps on a new 'Samsung' Smart TV and rate its speed and ease of use.",
    options: [
      "The interface is fast, smart, and easy to navigate.",
      "It has all the apps I need, but the remote is clunky.",
      "The system feels slow and sluggish.",
      "The interface is confusing and hard to find things."
    ]
  },
  {
    taskTitle: "Review a new type of reusable water bottle",
    taskDescription: "Use the 'HydroVessel' bottle for a day and evaluate if it leaks and how well it keeps water cold.",
    options: [
      "Completely leak-proof and water stayed ice-cold all day.",
      "It kept water cold, but the lid is hard to screw on.",
      "The bottle leaks if it's not perfectly upright.",
      "It did not keep my water cold at all."
    ]
  },
  {
    taskTitle: "Evaluate a photo editing app's AI enhancement feature",
    taskDescription: "Use the 'auto-enhance' feature in 'Adobe Lightroom Mobile' on a photo and rate the result.",
    options: [
      "It made my photo look professionally edited with one tap.",
      "It was a good starting point, but I needed to make tweaks.",
      "The enhancements looked unnatural and overdone.",
      "The feature made my photo look worse."
    ]
  },
  {
    taskTitle: "Review a public library's children's section",
    taskDescription: "Visit your local library and assess the selection of books and activities in the kids' area.",
    options: [
      "A wonderful, engaging space with a great book selection.",
      "Good book selection, but not much space to sit and read.",
      "The books are old and worn out.",
      "The children's area was messy and uninviting."
    ]
  },
  {
    taskTitle: "Rate a new video game's tutorial",
    taskDescription: "Play the tutorial level of 'Warriors of Zendikar' and assess how well it teaches the game mechanics.",
    options: [
      "Clear, concise, and I felt ready to play afterwards.",
      "It covered the basics, but I was still confused about some things.",
      "The tutorial was too long and boring.",
      "I finished the tutorial and still didn't know how to play."
    ]
  },
  {
    taskTitle: "Assess a new brand of dark chocolate",
    taskDescription: "Taste the 'Noir 85%' chocolate bar and rate its flavor complexity and smoothness.",
    options: [
      "A rich, complex, and incredibly smooth dark chocolate.",
      "Good flavor, but a slightly gritty texture.",
      "The flavor is too bitter, even for dark chocolate.",
      "It tasted chalky and lacked any real flavor."
    ]
  },
  {
    taskTitle: "Review a home meal kit delivery service",
    taskDescription: "Prepare a meal from 'HelloFresh' and rate the recipe instructions, ingredient freshness, and final taste.",
    options: [
      "Delicious meal, fresh ingredients, and easy-to-follow recipe.",
      "The meal was tasty, but the prep time was longer than stated.",
      "Some of the ingredients were not fresh.",
      "The recipe was confusing and the result was disappointing."
    ]
  },
  {
    taskTitle: "Evaluate a local car wash",
    taskDescription: "Get the basic wash at 'Sparkle Car Wash' and assess its thoroughness and value for money.",
    options: [
      "My car looks brand new! Great value.",
      "It cleaned most of the dirt off, but missed a few spots.",
      "The wash was too quick and didn't clean much.",
      "A waste of money, my car was still dirty."
    ]
  },
  {
    taskTitle: "Review a new album from a popular artist",
    taskDescription: "Listen to the new album by 'The Echoes' and rate its musical direction and overall quality.",
    options: [
      "A brilliant evolution of their sound!",
      "A solid album with a few standout tracks.",
      "It sounds too much like their previous work.",
      "A disappointing and uninspired album."
    ]
  },
  {
    taskTitle: "Rate a new waterproof phone case",
    taskDescription: "Submerge your phone in water (briefly!) with the 'AquaShield' case on and check for leaks.",
    options: [
      "Completely waterproof and my phone is perfectly dry.",
      "It kept my phone dry, but the case is bulky.",
      "A small amount of water got in.",
      "The case leaked and my phone got wet."
    ]
  },
  {
    taskTitle: "Assess a new brand of hiking boots",
    taskDescription: "Go on a short hike with the 'TerraTrekker' boots and evaluate their comfort, traction, and support.",
    options: [
      "Perfectly comfortable and amazing grip on the trail.",
      "Good support, but they needed some breaking in.",
      "The traction was not great on slippery surfaces.",
      "I got painful blisters within the first mile."
    ]
  },
  {
    taskTitle: "Review a new antioxidant face serum",
    taskDescription: "Use 'Glow Elixir' for a week and evaluate how it feels and if you see any change in your skin.",
    options: [
      "My skin looks brighter and feels amazing!",
      "It feels nice on the skin, but I haven't seen a major difference.",
      "The serum felt sticky and didn't absorb well.",
      "It caused my skin to break out."
    ]
},
  {
    taskTitle: "Evaluate a grammar-checking software",
    taskDescription: "Write a document using 'Grammarly' and assess the quality of its suggestions and explanations.",
    options: [
      "It caught all my mistakes and helped me write better.",
      "It found some errors, but also made some incorrect suggestions.",
      "The suggestions were often awkward or changed my meaning.",
      "The software slowed down my computer significantly."
    ]
  },
  {
    taskTitle: "Review a new flavor of Greek yogurt",
    taskDescription: "Taste the 'Olympus' brand Key Lime Pie flavor and rate its taste and texture.",
    options: [
      "A delicious and creamy treat, tastes just like the dessert!",
      "The flavor is good, but a little too artificial.",
      "The texture is thin and watery.",
      "It has a strange chemical aftertaste."
    ]
  },
  {
    taskTitle: "Rate a politician's recent speech",
    taskDescription: "Watch a recent speech and evaluate its clarity, persuasiveness, and substance.",
    options: [
      "Clear, convincing, and full of substance.",
      "Persuasive, but light on specific details.",
      "The speech was confusing and hard to follow.",
      "It felt dishonest and lacked any real message."
    ]
  },
  {
    taskTitle: "Assess a new electric scooter's range",
    taskDescription: "Ride the 'CityGlide' scooter on a full charge until the battery dies and measure the distance.",
    options: [
      "The range exceeded the manufacturer's claims.",
      "It got close to the advertised range.",
      "The actual range was much shorter than advertised.",
      "The battery meter is inaccurate."
    ]
  },
  {
    taskTitle: "Review a new stand-up comedy special",
    taskDescription: "Watch the latest special from a comedian on 'Netflix' and rate how funny it was.",
    options: [
      "I was laughing the entire time.",
      "It had some funny moments, but was inconsistent.",
      "None of the jokes landed for me.",
      "The comedian's material was unoriginal."
    ]
  },
  {
    taskTitle: "Evaluate a hotel's Wi-Fi speed and reliability",
    taskDescription: "Connect to the Wi-Fi at a 'Marriott' hotel and test its speed and connection stability.",
    options: [
      "Fast and reliable, perfect for streaming and work.",
      "The speed was decent, but it disconnected a few times.",
      "It was too slow to stream videos.",
      "The connection was unstable and practically unusable."
    ]
  },
  {
    taskTitle: "Review a new type of pasta sauce",
    taskDescription: "Try the 'Tuscan Traditions' arrabbiata sauce and rate its flavor and ingredient quality.",
    options: [
      "Rich, authentic flavor with high-quality ingredients.",
      "A good, basic pasta sauce, but nothing special.",
      "The sauce was too watery and lacked flavor.",
      "It tasted overly sweet and artificial."
    ]
  },
  {
    taskTitle: "Rate a museum's mobile app guide",
    taskDescription: "Use the 'Met Museum's' app to learn about an exhibit and assess its content and ease of use.",
    options: [
      "The app provided fascinating context and was easy to use.",
      "The content was good, but the app was slow to load.",
      "It was difficult to find the right audio track for the artwork.",
      "The app kept crashing while I was using it."
    ]
  },
  {
    taskTitle: "Assess a new brand of shampoo",
    taskDescription: "Wash your hair with 'SilkStrands' shampoo and evaluate how it lathers, cleans, and leaves your hair feeling.",
    options: [
      "My hair feels incredibly clean, soft, and shiny.",
      "It cleaned my hair, but felt a bit stripping.",
      "It didn't lather well and I had to use a lot of product.",
      "My hair felt greasy and weighed down after using it."
    ]
  },
  {
    taskTitle: "Review a new political commentary book",
    taskDescription: "Read 'The Divided States' and evaluate its arguments, evidence, and overall perspective.",
    options: [
      "A well-argued and thought-provoking analysis.",
      "An interesting perspective, but lacked strong evidence.",
      "The author's bias was too strong and undermined the arguments.",
      "The book was poorly written and repetitive."
    ]
  },
  {
    taskTitle: "Evaluate a smart plug's responsiveness",
    taskDescription: "Use a voice assistant to turn a 'Kasa Smart Plug' on and off and rate how quickly it responds.",
    options: [
      "It responds instantly every time.",
      "There's a slight delay, but it's acceptable.",
      "It sometimes fails to respond to commands.",
      "The plug frequently loses its connection."
    ]
  },
  {
    taskTitle: "Review a new puzzle game on your phone",
    taskDescription: "Play the first 20 levels of 'BlockSort' and rate its difficulty curve and enjoyability.",
    options: [
      "A perfectly challenging and addictive puzzler.",
      "Fun at first, but the difficulty spikes too quickly.",
      "The puzzles are too easy and become boring.",
      "The game is filled with intrusive ads."
    ]
  },
  {
    taskTitle: "Rate the effectiveness of a stain remover pen",
    taskDescription: "Use a 'Tide to Go' pen on a fresh coffee stain and assess how well it removes the stain.",
    options: [
      "The stain completely disappeared!",
      "It faded the stain, but didn't remove it completely.",
      "It didn't seem to have much effect on the stain.",
      "It made the stain worse by spreading it."
    ]
  },
  {
    taskTitle: "Assess a new brand of non-dairy milk",
    taskDescription: "Try 'Oatly' oat milk in your coffee and cereal and rate its taste and texture.",
    options: [
      "Creamy and delicious, the best dairy alternative I've tried.",
      "It's good in cereal, but tastes strange in coffee.",
      "The texture is too thin and watery for me.",
      "It has a strange, unpleasant aftertaste."
    ]
  },
  {
    taskTitle: "Review a popular YouTuber's latest video",
    taskDescription: "Watch a new video from 'Marques Brownlee' and rate its content, production quality, and engagement.",
    options: [
      "Informative, engaging, and beautifully shot.",
      "The content was interesting, but the pacing was slow.",
      "This video felt more like a paid advertisement.",
      "The information presented was inaccurate."
    ]
  },
  {
    taskTitle: "Evaluate a new electric kettle",
    taskDescription: "Boil water with the 'QuickBoil' kettle and rate its speed, noise level, and ease of use.",
    options: [
      "Boils water incredibly fast and is surprisingly quiet.",
      "It's fast, but also very loud.",
      "The kettle is slow to boil.",
      "The automatic shut-off feature doesn't work."
    ]
  },
  {
    taskTitle: "Review a farmer's market",
    taskDescription: "Visit a local farmer's market and assess the variety of vendors, produce quality, and prices.",
    options: [
      "Great variety of fresh, local produce at fair prices.",
      "Good quality, but more expensive than the grocery store.",
      "The selection was very limited.",
      "Many of the vendors were just resellers, not farmers."
    ]
  },
  {
    taskTitle: "Rate a new crime thriller novel",
    taskDescription: "Read 'Shadow of a Doubt' and evaluate its plot twists, character depth, and suspense.",
    options: [
      "A gripping page-turner I couldn't put down!",
      "A solid thriller, but I guessed the ending.",
      "The plot was unbelievable and full of clichés.",
      "The characters were one-dimensional and uninteresting."
    ]
  }
];

    