require('dotenv').config();

module.exports = { 
    github: {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
        scope: ['user:email'],
    },
    bitbucket: {
        clientID: process.env.BITBUCKET_CLIENT_ID,
        clientSecret: process.env.BITBUCKET_CLIENT_SECRET,
        callbackURL: process.env.BITBUCKET_CALLBACK_URL,
    }
}
  