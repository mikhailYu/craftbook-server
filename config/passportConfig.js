var passport = require("passport");
var GoogleStrategy = require("passport-google-oidc");
const LocalStrategy = require("passport-local").Strategy;
require("dotenv").config();
const User = require("../models/userModel");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: "/user/redirect",
    },
    (issuer, profile, cb, done) => {
      User.findOne({ googleId: profile.id }).then((currentUser) => {
        if (currentUser) {
          done(null, currentUser);
        } else {
          new User({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName,
            bio: "",
            location: "",
            setUpComplete: false,
            profilePic: {
              defaultSettings: { isDefault: true, defaultIndex: 0 },
              picId: null,
            },
            guest: false,
            theme: 0,
          })
            .save()
            .then((user) => {
              done(null, user);
            });
        }
      });
    }
  )
);

passport.use(
  new LocalStrategy(
    {
      username: "username",
      password: "password",
    },
    async (username, password, done) => {
      new User({
        username: `Guest ${username}`,
        setUpComplete: true,
        bio: "",
        location: "",
        guest: true,
        profilePic: {
          defaultSettings: { isDefault: true, defaultIndex: 0 },
          picId: null,
        },
        theme: 0,
      })
        .save()
        .then((user) => {
          return done(null, user);
        });
    }
  )
);
