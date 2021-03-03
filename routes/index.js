var express = require('express');
var router = express.Router();
var discord = require('discord-bot-webhook');
var yaml = require('js-yaml');
var fs   = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Jira Discord Bot ' });
});

/* GET webhook page. */
router.post('/:hookId/:hookToken', function(req, res, next) {
    discord.hookId = req.params.hookId;
    discord.hookToken = req.params.hookToken;

    console.log(JSON.stringify(req.body));

    var issue = req.body.issue;
    if (issue.assignee === null) {
        issue.assignee = {displayName: "nobody"};
    }

    var user = req.body.user;
    var action = req.body.issue_event_type_name.split('_')[1];
    var matches = issue.self.match(/^(https?:\/\/[^\/?#]+)(?:[\/?#]|$)/i);
    var domain = matches && matches[1];

    discord.userName = 'Jira';
    discord.avatarUrl = req.protocol + '://' + req.get('host') + '/images/jira.png';

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

    res.render('index', { title: 'Jira Discord Bot' });
});

module.exports = router;
