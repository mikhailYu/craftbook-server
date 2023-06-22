var passport = require("passport");
var GoogleStrategy = require("passport-google-oidc");
const LocalStrategy = require("passport-local").Strategy;
require("dotenv").config();
const User = require("../models/userModel");

passport.serializeUser((user, done) => {
  console.log("user serialized");
  return done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  console.log("user deserialized");
  try {
    const user = await User.findById(id);
    console.log(user);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: "/user/redirect",
    },
    // removed cb, between profile and done
    async (issuer, profile, done) => {
      console.log("google strategy called");
      await User.findOne({ googleId: profile.id }).then((currentUser) => {
        if (currentUser) {
          return done(null, currentUser);
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
              console.log("google strategy completed");
              return done(null, user);
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
      console.log("local strategy called");
      await new User({
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
          console.log("local strategy completed");
          return done(null, user);
        });
    }
  )
);
