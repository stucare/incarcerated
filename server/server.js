require('./config/config');

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const hbs = require('hbs');
const fs = require('fs');
const path = require('path')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const logger = require('./logger/logger');
const { seed } = require('./db/seed');

let { mongoose } = require('./db/mongoose');
let { User } = require('./../models/user');
let { Maintenance } = require('./../models/maintenance');
let { getAuthenticatedUser } = require('./middleware/authenticate');

const PORT = process.env.PORT;
const PUBLIC_PATH = path.join(__dirname, '../wwwroot')

let app = express();
let server = http.createServer(app);
let io = socketIO(server);

// serve static
app.use(express.static(PUBLIC_PATH));

hbs.registerPartials(path.join(__dirname, '../views/partials'));
app.set('view engine', 'hbs');

// todo move to separate file
hbs.registerHelper('getYear', () => {
    return new Date().getFullYear();
});

if (process.env.NODE_ENV !== 'test') {
    seed.seedDb();
}

app.use(bodyParser.json());
app.use(cookieParser());

app.all(/^(?!((\/api){1,}|(\/admin){1,})).*$/, async (req, res, next) => {
    try {
        let maint = await Maintenance.findOne({});
        if (maint) {
            if (maint.active) {
                let user = await getAuthenticatedUser(req);
                if (!user || !user.isSuperuser) {
                    return res.render('maintenance', {
                        layout: false
                    });
                }
            }
        }
        next();
    } catch (error) {
        logger.errorlog(req, res, "Failed to check maint", error);
        res.status(500).send();
    }
});

app.use((req, res, next) => {
    res.on("finish", function () {
        logger.serverlog(req, res, next);
    });
    next();
});

// routers
let adminRouter = express.Router();
require('./routers/admin')(adminRouter);
app.use('/admin', adminRouter);

let apiRouter = express.Router();
require('./routers/api')(apiRouter);
app.use('/api', apiRouter);

// routes
app.get('/', (req, res) => {
    res.render('layout', {
        title: 'Home',
        template: 'pages/home',
        mainClass: 'home',
        activeNav: {
            home: true
        }
    });
});

app.get('/teambuilding', (req, res) => {
    res.render('layout', {
        title: 'Teambuilding',
        template: 'pages/teambuilding',
        mainClass: 'teambuilding',
        activeNav: {
            teambuilding: true
        }
    });
});

app.get('/ourrooms', (req, res) => {
    res.render('layout', {
        title: 'Our Rooms',
        template: 'pages/ourrooms',
        mainClass: 'ourrooms',
        activeNav: {
            ourrooms: true
        }
    });
});

app.get('/visitingus', (req, res) => {
    res.render('layout', {
        title: 'Visiting Us',
        template: 'pages/visitingus',
        mainClass: 'visitingus',
        activeNav: {
            visitingus: true
        }
    });
});

app.get('/leaderboards', (req, res) => {
    res.render('layout', {
        title: 'Leaderboards',
        template: 'pages/leaderboards',
        mainClass: 'leaderboards',
        activeNav: {
            leaderboards: true
        }
    });
});

app.get('/giftvouchers', (req, res) => {
    res.render('layout', {
        title: 'Gift Vouchers',
        template: 'pages/giftvouchers',
        mainClass: 'giftvouchers',
        activeNav: {
            giftvouchers: true
        }
    });
});

app.get('/contact', (req, res) => {
    res.render('layout', {
        title: 'Contact',
        template: 'pages/contact',
        mainClass: 'contact',
        activeNav: {
            contact: true
        }
    });
});

app.get('/booknow', (req, res) => {
    res.render('layout', {
        title: 'Book Now',
        template: 'pages/book',
        mainClass: 'book',
        activeNav: {
            book: true
        }
    });
});

require('./socket')(io);

// listener
server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}\t\thttp://localhost:${PORT} | https://incarcerated.herokuapp.com/`);
})

module.exports = { app };
