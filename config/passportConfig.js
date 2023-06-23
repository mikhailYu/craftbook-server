var passport = require("passport");
var GoogleStrategy = require("passport-google-oidc");
const LocalStrategy = require("passport-local").Strategy;
require("dotenv").config();
const User = require("../models/userModel");

passport.serializeUser((user, done) => {
  console.log("user serialized " + user.id);
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      callbackURL: `/user/redirect`,
      passReqToCallback: true,
      proxy: true,
      passport: true,
    },
    async (req, issuer, profile, cd, done) => {
      console.log("google strat fired");
      const googleUser = await User.findOne({ googleId: profile.id });
      console.log(googleUser);
      if (googleUser) {
        console.log("google user exists");
        console.log("googleUser: " + googleUser);

        return done(null, googleUser);
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
            return done(null, user);
          });
      }
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
          return done(null, user);
        });
    }
  )
);
