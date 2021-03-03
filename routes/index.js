var express = require('express');
var router = express.Router();
var discord = require('discord-bot-webhook');
var yaml = require('js-yaml');
var fs   = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET webhook page. */
router.post('/:hookId/:hookToken', function(req, res, next) {
    discord.hookId = req.params.hookId;
    discord.hookToken = req.params.hookToken;

    var issue = req.body.issue;
    if (issue.assignee === null) {
        issue.assignee = {displayName: "nobody"};
    }

    var user = req.body.user;
    var action = req.body.issue_event_type_name.split('_')[1];
    var matches = issue.self.match(/^(https?:\/\/[^\/?#]+)(?:[\/?#]|$)/i);
    var domain = matches && matches[1];

    discord.userName = 'JiraWebhook';
    discord.avatarUrl = 'https://seeklogo.com/images/A/atlassian-logo-73142F0575-seeklogo.com.gif';

    try {
        var actionsMessages = yaml.safeLoad(fs.readFileSync('messages_templates.yml', 'utf8'));
    } catch (e) {
        console.log(e);
    }

    if (actionsMessages[action]) {
        var actionMessage = actionsMessages[action];
        var regex = /({{)([\\.a-zA-Z0-9]+)(}})/g;
        var message = actionMessage.replace(regex, function(match, text, urlId) {
            return eval(urlId);
        });

        discord.sendMessage(message);
    }

    res.render('index', { title: 'Express' });
});

module.exports = router;
