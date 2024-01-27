const truecallerjs = require("truecallerjs")
__path = process.cwd()
require("./settings");
const mongoose = require('mongoose');
var express = require('express'),
    cors = require('cors'),
    flash = require('connect-flash'),
    rateLimit = require("express-rate-limit"),
    passport = require('passport'),
    expressLayout = require('express-ejs-layouts'),
    compression = require('compression'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    MemoryStore = require('memorystore')(session),
    secure = require('ssl-express-www'),
    cors = require ("cors"),
    schedule = require('node-schedule');
    
const PORT = process.env.PORT || 8080 || 5000 || 3000
var app = express()
var { color } = require('./lib/color.js')


const { connectMongoDb } = require('./MongoDB/mongodb');
var mainrouter = require('./routes/main')
connectMongoDb();
app.set('trust proxy', 1);
app.use(compression());

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 2000, 
  message: 'Oops too many requests'
});
app.use(limiter);

app.set('view engine', 'ejs');
app.use(expressLayout);
app.use(express.static("assets"))

app.enable('trust proxy');
app.set("json spaces",2)
app.use(cors())
app.use(secure)

app.use(session({
  secret: 'secret',  
  resave: true,
  saveUninitialized: true,
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000
  }),
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
})

app.get('/', (req, res) => {
    res.render('about', {
    layout: 'about'
  });
})

app.get('/contact', (req, res) => {
    res.render('contact', {
    layout: 'contact'
  });
})

app.get("/truecaller", async (req, res) => {
  var num = req.query.number
  if (!num) return res.json({ status : false, creator : "Shefin", message : "Need a Number!"})
  try {
  let values = ["a1i0W--kd05Vhk0FiaOfRgdP2h7MjUyPteo7Vxh5NRH81zd6EqwLGg1m177haqk3", "a1i0L--kd0KkgVu-Q_7UUlZ3O3UckL6kiDJ3xbm-7BF69sRIZo_jEpANz77hbnk-"]
  let key = values[Math.floor(Math.random() * values.length)]
  var searchData = {
    number: num,
    countryCode: "IN",
    installationId: key,
    output:"JSON"
  }
  var sn = truecallerjs.search(searchData);
  sn.then(function(response) {
  var rs = JSON.parse(response);
  res.json({
     phone: num,
     name:rs.data[0].name,
     score:rs.data[0].score,
     access:rs.data[0].access, 
     carrier:rs.data[0].phones[0].carrier,
     dialingCode:rs.data[0].phones[0].dialingCode,
     country:rs.data[0].addresses[0].countryCode,
     city:rs.data[0].addresses[0].city,
     img:rs.data[0].image,
     numberType:rs.data[0].phones[0].numberType,
     timeZone:rs.data[0].addresses[0].timeZone
  })
 });
 } catch (error) {
   console.log(error)
  res.json({
   status: false,
   creator: "Shefin"
   })
 }
});


app.use(function (req, res, next) {
    res.status(404).json({
        status: false,
        message: "Page not found"
    })
})

app.listen(PORT, () => {
    console.log(color("Server running on port " + PORT,'green'))
})

module.exports = app
