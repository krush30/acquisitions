import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";



const aj = arcjet({
    // Get your site key from https://app.arcjet.com and set it as an environment
    // variable rather than hard coding.
    key: process.env.ARCJET_KEY,
    rules: [
        shield({ mode: "LIVE" }),
        detectBot({
            mode: "LIVE",
            allow: [
                "CATEGORY:SEARCH_ENGINE",
                "CATEGORY:PREVIEW"// Google, Bing, etc
                // Uncomment to allow these other common bot categories
                // See the full list at https://arcjet.com/bot-list
                //"CATEGORY:MONITOR", // Uptime monitoring services
                //"CATEGORY:PREVIEW", // Link previews e.g. Slack, Discord
            ],
        }),
        slidingWindow({
            mode: "LIVE",
            interval: '2s',
            max: 5
        })
    ],
});

export default aj;