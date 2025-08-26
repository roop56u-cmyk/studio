
export type MessageItem = {
  label: string;
  description: string;
  defaultValue: string;
};

export type MessageCategory = {
  title:string;
  description: string;
  messages: {
    [key: string]: MessageItem;
  };
};

export const platformMessages: { [categoryKey: string]: MessageCategory } = {
  withdrawal: {
    title: "Withdrawal Process Messages",
    description: "Alerts, dialogs, and notifications shown during the withdrawal process.",
    messages: {
      restrictionPopup: {
        label: "Time Restriction Popup",
        description: "Shown when a user tries to withdraw before their waiting period is over. This is also editable in System Settings.",
        defaultValue: "Please wait for 45 days to initiate withdrawal request.",
      },
      pendingRequestTitle: {
        label: "Pending Request Title",
        description: "Title of the alert when a user has an existing pending withdrawal.",
        defaultValue: "Pending Request",
      },
      pendingRequestDescription: {
        label: "Pending Request Description",
        description: "Body text of the alert when a user has an existing pending withdrawal.",
        defaultValue: "You already have a withdrawal request pending. Please wait for it to be processed before submitting a new one.",
      },
      limitReachedTitle: {
        label: "Monthly Limit Reached Title",
        description: "Title of the alert when a user exceeds their monthly withdrawal limit.",
        defaultValue: "Monthly Limit Reached",
      },
      limitReachedDescription: {
        label: "Monthly Limit Reached Description",
        description: "Body text for the monthly limit alert. Use [X] for count and [Y] for level.",
        defaultValue: "You have reached your monthly withdrawal limit of [X] for Level [Y]. Please try again next month.",
      },
      minAmountTitle: {
        label: "Minimum Amount Title",
        description: "Title of the alert when the user's withdrawal amount is too low.",
        defaultValue: "Minimum Withdrawal Amount",
      },
      minAmountDescription: {
        label: "Minimum Amount Description",
        description: "Body text for the minimum amount alert. Use [Y] for level and [Amount] for the minimum amount.",
        defaultValue: "The minimum withdrawal amount for Level [Y] is $[Amount]. Please enter a higher amount.",
      },
    }
  },
  recharge: {
    title: "Recharge Process Messages",
    description: "Alerts and dialogs shown during the fund recharge process.",
    messages: {
       addressRequiredTitle: {
        label: "Withdrawal Address Required Title",
        description: "Title for the alert when a user must set a withdrawal address before recharging.",
        defaultValue: "Withdrawal Address Required",
      },
       addressRequiredDescription: {
        label: "Withdrawal Address Required Description",
        description: "Body text for the alert when a user must set a withdrawal address before recharging.",
        defaultValue: "For security, you must set up at least one withdrawal address before you can make a recharge request. Please go to the Withdrawal panel to add an address.",
      },
      confirmDepositTitle: {
        label: "Confirm Deposit Title",
        description: "Title for the final confirmation dialog before submitting a recharge request.",
        defaultValue: "Confirm Deposit",
      },
      confirmDepositDescription: {
        label: "Confirm Deposit Description",
        description: "Body text for the final confirmation dialog. Use [Amount] for the recharge amount.",
        defaultValue: "Please ensure you have already sent [Amount] to the selected address. Submitting a request without sending funds may result in account restrictions.",
      },
    }
  },
};
