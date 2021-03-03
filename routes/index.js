var express = require('express');
var router = express.Router();
var discord = require('../services/discord');
var yaml = require('js-yaml');
var fs   = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Jira Discord Bot ' });
});

/* GET webhook page. */
router.post('/:hookId/:hookToken', function(req, res, next) {
    try {
        discord.hookId = req.params.hookId;
        discord.hookToken = req.params.hookToken;
        discord.userName = 'Jira';
        discord.avatarUrl = req.protocol + '://' + req.get('host') + '/images/jira.png';
        
        discord.send(parseBody(req.body));

        return newBody;
    } catch (err) {
        console.error(err);
    }

    res.render('index', { title: 'Jira Discord Bot' });
});

function parseBody(body) {
    let newBody
    let comment

    switch (body.webhookEvent) {
        case 'jira:issue_created':
            try {
                newBody = {
                    "content": "Ticket created",
                    "embeds": [{
                        "author": {
                            "name": body.user.displayName,
                            "icon_url": body.user.avatarUrls['48x48']
                        },
                        "title": body.issue.fields.description,
                        "description": "[" + body.issue.key + ": " + body.issue.fields.summary + "](" + body.domain + body.issue.key + ")",
                        "color": 15351320,
                        "fields": [{
                                "name": "Type:",
                                "value": body.issue.fields.issuetype.name,
                                "inline": true
                            },
                            {
                                "name": "Priority:",
                                "value": body.issue.fields.priority.name,
                                "inline": true
                            },
                            {
                                "name": "Status:",
                                "value": body.issue.fields.status.statusCategory.name,
                                "inline": true
                            }
                        ]
                    }]
                }
                return newBody;
            } catch (err) {
                throw new Error("case jira:issue_created issue: " + err)
            }
        case 'jira:issue_updated':
            try {
                newBody = {
                    "content": "Ticket updated",
                    "embeds": [{
                        "author": {
                            "name": body.user.displayName,
                            "icon_url": body.user.avatarUrls['48x48']
                        },
                        // "title": body.issue.fields.description,
                        "description": "[" + body.issue.key + ": " + body.issue.fields.summary + "](" + body.domain + body.issue.key + ")",
                        "color": 16249146,
                        "fields": [{
                                "name": "Type:",
                                "value": body.issue.fields.issuetype.name,
                                "inline": true
                            },
                            {
                                "name": "Priority:",
                                "value": body.issue.fields.priority.name,
                                "inline": true
                            },
                            {
                                "name": "Status:",
                                "value": body.issue.fields.status.statusCategory.name,
                                "inline": true
                            }
                        ]
                    }]
                }
                return newBody;
            } catch (err) {
                throw new Error("case jira:issue_updated issue: " + err)
            }
        case 'comment_created':
            try {
                if (body.comment.body.length > 1000) {
                    comment = body.comment.body.substring(0, 1000) + "..."
                } else {
                    comment = body.comment.body
                }
                newBody = {
                    "content": "Ticket was commented",
                    "embeds": [{
                        "author": {
                            "name": body.comment.author.displayName,
                            "icon_url": body.comment.author.avatarUrls['48x48']
                        },
                        "title": body.issue.fields.description,
                        "description": "[" + body.issue.key + ": " + body.issue.fields.summary + "](" + body.domain + body.issue.key + ")",
                        "color": 7465496,
                        "fields": [{
                                "name": "Type:",
                                "value": body.issue.fields.issuetype.name,
                                "inline": true
                            },
                            {
                                "name": "Priority:",
                                "value": body.issue.fields.priority.name,
                                "inline": true
                            },
                            {
                                "name": "Status:",
                                "value": body.issue.fields.status.statusCategory.name,
                                "inline": true
                            },
                            {
                                "name": "Comment:",
                                "value": comment
                            }
                        ]
                    }]
                }
                return newBody;
            } catch (err) {
                throw new Error("case comment_created issue: " + err)
            }
        case 'project_created':
            try {
                newBody = {
                    "username": "Jira",
                    "avatar_url": "https://i.imgur.com/mdp3NY3.png",
                    "content": "Project created",
                    "embeds": [{
                        "author": {
                            "name": body.project.projectLead.name,
                        },
                        "title": body.project.name,
                        "color": 14498551,
                    }]
                }
                return newBody;
            } catch (err) {
                throw new Error("case project_created issue: " + err)
            }
        default:
            var issue = req.body.issue;
            if (issue.assignee === null) {
                issue.assignee = {displayName: "nobody"};
            }

            console.log(JSON.stringify(req.body));

            var user = req.body.user;
            var action = req.body.issue_event_type_name.split('_')[1];
            var matches = issue.self.match(/^(https?:\/\/[^\/?#]+)(?:[\/?#]|$)/i);
            var domain = matches && matches[1];

            var actionsMessages = yaml.safeLoad(fs.readFileSync('messages_templates.yml', 'utf8'));
        
            if (actionsMessages[action]) {
                var actionMessage = actionsMessages[action];
                var regex = /({{)([\\.a-zA-Z0-9]+)(}})/g;
                var message = actionMessage.replace(regex, function(match, text, urlId) {
                    return eval(urlId);
                });
        
                newBody = {
                    "username": "Jira",
                    "avatar_url": "https://i.imgur.com/mdp3NY3.png",
                    "content": message,
                }
            }
            else {
                throw new Error("Unknow message");
            }

            return newBody;
    }
}

module.exports = router;
