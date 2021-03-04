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

        const data = parseBody(req.body);
        
        discord.send(data);
    } catch (err) {
        console.error(err);
    }

    res.render('index', { title: 'Jira Discord Bot' });
});

const getDomain = (url) => {
    let matches = url.match(/^(https?:\/\/[^\/?#]+)(?:[\/?#]|$)/i);
    let domain = matches && matches[1];
    return domain;
}

const truncate = (text, length) => (text.length > length) ? text.substring(0, length) + "..." : text;

function parseBody(body) {
    const colors = {
        "Bug": 15687519,
        "Improvement": 3254563,
        "Story": 709346,
        "Deploy": 8925056,
        "Epic": 8925056,
    };

    const symbols = {
        "Bug": ':red_circle:',
        "Improvement": ':green_circle:',
        "Story": ':blue_circle:',
        "Deploy": ':purple_circle:',
        "Epic": ':purple_circle:',
    };

    switch (body.issue_event_type_name) {
        case 'project_created':
            try {
                return {
                    "content": "Project created",
                    "embeds": [{
                        "author": {
                            "name": body.project.projectLead.name,
                        },
                        "title": body.project.name,
                        "color": 14498551,
                    }]
                }
            } catch (err) {
                throw new Error("case project_created issue: " + err)
            }
        case 'issue_created':
            try {
                return {
                    "embeds": [{
                        "thumbnail": {
                            "url": body.issue.fields.issuetype.iconUrl
                        },
                        "author": {
                            "name": `${body.user.displayName} created an ${body.issue.fields.issuetype.name}`,
                            "icon_url": body.user.avatarUrls['24x24']
                        },
                        "title": `${body.issue.key}: ${body.issue.fields.summary}`,
                        "description": body.issue.fields.description,
                        "url": `${getDomain(body.issue.self)}/${body.issue.key}`,
                        "color": colors[body.issue.fields.issuetype.name] || null,
                        "fields": [
                            {
                                "name": "Type",
                                "value": body.issue.fields.issuetype.name,
                                "inline": true
                            },
                            {
                                "name": "Priority",
                                "value": body.issue.fields.priority.name,
                                "inline": true
                            },
                            {
                                "name": "Status",
                                "value": body.issue.fields.status.statusCategory.name,
                                "inline": true
                            }
                        ],
                        // "footer": {
                        //   "text": `${body.user.displayName} created an ${body.issue.fields.issuetype.name}`,
                        //   "icon_url": body.user.avatarUrls['24x24']
                        // },
                    }]
                }
            } catch (err) {
                throw new Error("case issue_created issue: " + err)
            }
        case 'issue_updated':
            try {
                return {
                    "embeds": [{
                        "thumbnail": {
                            "url": body.issue.fields.issuetype.iconUrl
                        },
                        "author": {
                            "name": `${body.user.displayName} updated the ${body.changelog.items[0].field} of an ${body.issue.fields.issuetype.name}`,
                            "icon_url": body.user.avatarUrls['24x24']
                        },
                        "title": `${body.issue.key}: ${body.issue.fields.summary}`,
                        "description": body.issue.fields.description,
                        "url": `${getDomain(body.issue.self)}/${body.issue.key}`,
                        "color": colors[body.issue.fields.issuetype.name] || null,
                        "fields": [
                            {
                                "name": "Type",
                                "value": body.issue.fields.issuetype.name,
                                "inline": true
                            },
                            {
                                "name": "Priority",
                                "value": body.issue.fields.priority.name,
                                "inline": true
                            },
                            {
                                "name": "Status",
                                "value": body.issue.fields.status.statusCategory.name,
                                "inline": true
                            }
                        ],
                    }]
                }
            } catch (err) {
                throw new Error("case issue_updated issue: " + err)
            }
        case 'issue_generic':
            try {
                return {
                    "embeds": [{
                        "thumbnail": {
                            "url": body.issue.fields.issuetype.iconUrl
                        },
                        "author": {
                            "name": `${body.user.displayName} updated the ${body.changelog.items[0].field} of an ${body.issue.fields.issuetype.name}`,
                            "icon_url": body.user.avatarUrls['24x24']
                        },
                        "title": `${body.issue.key}: ${body.issue.fields.summary}`,
                        "url": `${getDomain(body.issue.self)}/${body.issue.key}`,
                        "color": colors[body.issue.fields.issuetype.name] || null,
                        "fields": [
                            {
                                "name": "From",
                                "value": body.changelog.items[0].fromString,
                                "inline": true
                            },
                            {
                                "name": "To",
                                "value": body.changelog.items[0].toString,
                                "inline": true
                            }
                        ],
                    }]
                }
            } catch (err) {
                throw new Error("case issue_updated issue: " + err)
            }
        case 'comment_created':
            try {
                return {
                    "embeds": [{
                        "thumbnail": {
                            "url": body.issue.fields.issuetype.iconUrl
                        },
                        "author": {
                            "name": `${body.user.displayName} commented on a ${body.issue.fields.issuetype.name}`,
                            "icon_url": body.user.avatarUrls['24x24']
                        },
                        "title": `${body.issue.key}: ${body.issue.fields.summary}`,
                        "url": `${getDomain(body.issue.self)}/${body.issue.key}`,
                        "color": colors[body.issue.fields.issuetype.name] || null,
                        "fields": [
                            {
                                "name": "Comment:",
                                "value": truncate(body.comment.body, 1000)
                            }
                        ],
                    }]
                }
            } catch (err) {
                throw new Error("case comment_created issue: " + err)
            }
        default:
            var issue = body.issue;
            if (issue.assignee === null) {
                issue.assignee = {displayName: "nobody"};
            }

            var user = body.user;
            var action = body.issue_event_type_name.split('_')[1];
            var matches = issue.self.match(/^(https?:\/\/[^\/?#]+)(?:[\/?#]|$)/i);
            var domain = matches && matches[1];

            var actionsMessages = yaml.safeLoad(fs.readFileSync('messages_templates.yml', 'utf8'));
        
            if (actionsMessages[action]) {
                var actionMessage = actionsMessages[action];
                var regex = /({{)([\\.a-zA-Z0-9]+)(}})/g;
                var message = actionMessage.replace(regex, function(match, text, urlId) {
                    console.log({urlId});
                    return eval(urlId);
                });
        
                return {
                    "username": "Jira",
                    "avatar_url": "https://i.imgur.com/mdp3NY3.png",
                    "content": message,
                }
            }
            else {
                throw new Error("Unknow message");
            }
    }
}

module.exports = router;
