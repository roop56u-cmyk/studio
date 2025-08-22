
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
];
