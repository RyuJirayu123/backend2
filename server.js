const express = require('express')
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const connectDB = require('./config/db');

//Load env vars
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp=require('hpp');
const cors=require('cors');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');




dotenv.config({ path: './config/config.env' });

connectDB();

const app = express();

const swaggerOptions={
    swaggerDefinition:{
    openapi: '3.0.0',
    info: {
        title: 'Library API',
        version: '1.0.0',
        description: 'A simple Express VacQ API'
          },
          servers:
[
{
url:process.env.HOST + ':' + PORT + '/api/v1'
}
],
    },
    apis:['./routes/*.js'],
};
const swaggerDocs=swaggerJsDoc(swaggerOptions);

app.use('/api-docs',swaggerUI.serve, swaggerUI.setup(swaggerDocs));


app.use(express.json());




app.use(helmet());

app.use(mongoSanitize());

app.use(xss());

app.use(hpp());

app.use(cors());

app.use(cookieParser());



const dentists = require('./routes/dentists');
const bookings = require('./routes/bookings');
const auth = require('./routes/auth');



app.use('/api/v1/dentists', dentists);
app.use('/api/v1/bookings', bookings);
app.use('/api/v1/auth', auth);



const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, "on" + process.env.HOST + ":" + PORT));

process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});