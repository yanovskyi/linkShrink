/* express */
import express from 'express';
import path from 'path';

/* 3rd party */
import cors from 'cors';

/* application */
import mainRoutes from './routes/main';
import sequelize from './utils/database';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join( __dirname, "views"));

// We need to enable cors for using our app as service by front-end app with different ip adress
app.use(cors());

app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(mainRoutes);

sequelize.sync()
.then((res) => {
    app.listen(3000);
})
.catch((err) => {
    console.log(err);
})
