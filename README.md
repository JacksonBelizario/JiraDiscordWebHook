This package permit to use webhook between jira and discord, so you know what happen on your jira directly on your discord server.

## USAGE
Run `npm start`
Then put in jira the url of your server ass follow: [PROTOCOL]://url_server:port/discord_hook_id/discord_hook_token
By default the port is 3000. If you do not know how to get your hook_id and hook_token, please refer to [this article](https://github.com/Mythen96/de.isekaidev.discord.wbbBridge/wiki/How-to-get-Webhook-ID-&-Token)

## Managed event
Currently only the creation, update and assignment of an issue.
If you wish to change the messages or add other kind of events; please edit the `messages_templates.yml` file.
I invite you tu use https://webhook.site or another website of the kind to find the variables you may need.