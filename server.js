const express = require('express')
const cors = require('cors')
const path = require('path')
const expressSession = require('express-session')

const app = express()
const http = require('http').createServer(app)

const session = expressSession({
    secret: 'coding is amazing',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
})
// Express App Config
app.use(express.json())
app.use(session)

if (process.env.NODE_ENV === 'production') {
    app.use(express.static('public'))
} else {
    const corsOptions = {
        origin: ['http://127.0.0.1:8080', 'http://localhost:8080', 'http://127.0.0.1:3000', 'http://localhost:3000'],
        credentials: true
    }
    app.use(cors(corsOptions))
}

const authRoutes = require('./api/auth/auth.routes')
const userRoutes = require('./api/user/user.routes')
const boardRoutes = require('./api/board/board.routes')
const { connectSockets } = require('./services/socket.service')

// routes
const setupAsyncLocalStorage = require('./middlewares/setupAls.middleware')
app.all('*', setupAsyncLocalStorage)

app.get('/api/setup-session', (req, res) => {
    req.session.connectedAt = Date.now()
    console.log('setup-session:', req.sessionID);
    res.end(req.sessionID)
})

app.use('/api/auth', authRoutes)
app.use('/api/user', userRoutes)
app.use('/api/board', boardRoutes)
//app.use('/api/')
connectSockets(http, session)

// Make every server-side-route to match the index.html
// so when requesting http://localhost:3030/index.html/car/123 it will still respond with
// our SPA (single page app) (the index.html file) and allow vue/react-router to take it from there
app.get('/**', (req, res) => {
    console.log('@@@')
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const logger = require('./services/logger.service')
const port = process.env.PORT || 3030


http.listen(port, () => { 
    console.log(`App listening on port ${port}!`) 
})

console.log('I am Here!')



