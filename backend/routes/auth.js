const express = require('express');
const passport = require('passport');
const router = express.Router();
const GitHubStrategy = require('passport-github2').Strategy;
const BitbucketStrategy = require('passport-oauth2').Strategy;
const keys = require('../config/keys');

const { db } = require('../firebase');


const storeData = async (username, data) => {
  try {
    const docRef = db.collection('users').doc(username); 
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      return { success: true, message: "user data exists" };
    }
    await docRef.set(data);
    return { success: true, message: "user data stored successfully" };

  } catch (error) {
      return { success: false, error: error.message };
    }
}



// GitHub OAuth strategy
passport.use(new GitHubStrategy(keys.github,
  (accessToken, refreshToken, profile, done) => {
    profile.accessToken = accessToken;
    //console.log('profile : ',profile)
    return done(null, profile);
  }
));

// BitBucket OAuth strategy
passport.use(new BitbucketStrategy({
      authorizationURL: 'https://bitbucket.org/site/oauth2/authorize?scope=account',
      tokenURL: 'https://bitbucket.org/site/oauth2/access_token',
      clientID: keys.bitbucket.clientID,
      clientSecret: keys.bitbucket.clientSecret,
      callbackURL: keys.bitbucket.callbackURL,
    },
    (token, tokenSecret, profile, done) => {
      profile.accessToken = token;
      //console.log('profile : ',profile)
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// GitHub Login
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

const fetch = require('node-fetch'); 

// GitHub Callback
router.get('/github/callback',
  passport.authenticate('github', { failureRedirect: '/auth/failure' }),
  async (req, res) => {

    const accessToken = req.user.accessToken;

    try {
      const emailResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          // biome-ignore lint/complexity/useLiteralKeys: <explanation>
          'Authorization': `Bearer ${accessToken}`,
        },
      });
      
      const emailData = await emailResponse.json();

      const primaryEmail = emailData.find(email => email.primary).email;


      // Fetch repositories data from GitHub API
      const reposResponse = await fetch('https://api.github.com/user/repos', {
        headers: {
          // biome-ignore lint/complexity/useLiteralKeys: <explanation>
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const reposData = await reposResponse.json();

      const repoMap = reposData.reduce((acc, repo) => {
        acc[repo.full_name] = false; 
        return acc;
      }, {});


      const data = {
        username: req.user.username,
        name : req.user.displayName,
        email : primaryEmail,
        repo: repoMap
      }

      const result = await storeData(req.user.id, data);
      
      if (result.success) {
        console.log(result.message);
        req.session.user = req.user.id
        res.redirect('http://localhost:5173/home?name=Github');
      } else {
        console.log('Error storing data:', result.error);
        res.redirect('/auth/failure');
      }
    } catch (error) {
      console.error(error);
      res.redirect('/auth/failure');
     // res.status(500).json({ error: 'Failed to fetch data from GitHub' });
    }
  }
);

// GitLab Login
router.get('/bitbucket', passport.authenticate('oauth2'));

// GitLab Callback
router.get('/bitbucket/callback',
  passport.authenticate('oauth2', { failureRedirect: '/auth/failure' }),
  async (req, res) => {

    const accessToken = req.user.accessToken;

    try {
      // Fetch user data from GitHub API
      const userResponse = await fetch('https://api.bitbucket.org/2.0/user', {
        headers: {
          // biome-ignore lint/complexity/useLiteralKeys: <explanation>
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const userData = await userResponse.json();

      const emailResponse = await fetch('https://api.bitbucket.org/2.0/user/emails', {
        headers: {
          // biome-ignore lint/complexity/useLiteralKeys: <explanation>
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const emailData = await emailResponse.json();

      const email = emailData.values[0].email

      // Fetch repositories data from GitHub API
      const reposResponse = await fetch('https://api.bitbucket.org/2.0/user/permissions/repositories', {
        headers: {
          // biome-ignore lint/complexity/useLiteralKeys: <explanation>
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const reposData = await reposResponse.json();

      const repoMap = {}

      const writableRepos = reposData.values.filter(
        repo => repo.permission === 'write' || repo.permission === 'admin'
      );
  
      // Create key-value pairs with repo name as key and false as value
      // biome-ignore lint/complexity/noForEach: <explanation>
      writableRepos.forEach(repo => {
        repoMap[repo.repository.full_name] = false;
      });


      const data = {
        username: userData.username,
        name : userData.display_name,
        email: email,
        repo: repoMap
      }
      //console.log(data)

      const result = await storeData(userData.account_id, data);
      
      if (result.success) {
        console.log(result.message);
        req.session.user = userData.account_id
        res.redirect('http://localhost:5173/home?name=BitBucket');
      } else {
        console.log('Error storing data:', result.error);
        res.redirect('/auth/failure');
      }
    } catch (error) {
      console.error(error);
      //res.status(500).json({ error: 'Failed to fetch data from GitHub' });
      res.redirect('/auth/failure'); 
    } 
  }
);

router.get('/failure', (req, res) => {
  // Redirect to login with an error message
  res.redirect('http://localhost:5173/?error=Authentication failed');
});


router.get('/getSession', async (req, res) => {

  try{
    const id = req.session.user
    const docRef = db.collection('users').doc(id); 
    const docSnapshot = await docRef.get();

    if (docSnapshot.exists) {
      const data = docSnapshot.data()
      data.id = id
      console.log(data)
      res.json(data);
    }
  } catch(error) {
    console.error('Error retrieving session data:', error);
    res.status(500).send('Error retrieving session data:');
  }
})


router.post('/update', async (req, res) => {
  try {
    const { userId, reposData } = req.body;  // Expecting userId and review data

    const docRef = db.collection('users').doc(userId);

    // Update the review data
    await docRef.update({
      repo: reposData, 
    });

    res.status(200).send('Review data updated successfully');
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).send('Error updating review data');
  }
});

// Logout route - destroy session
router.get('/logout', (req, res) => {

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to destroy session' });
    }
    res.clearCookie('connect.sid'); // Remove the session cookie
    res.status(200).send("session cleard")
  });
}); 

module.exports = router;
