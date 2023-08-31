import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import mainRoutes from './routes/main';
import sequelize from './utils/database';

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join( __dirname, "views"));

app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(mainRoutes);

sequelize.sync()
.then((res) => {
    app.listen(3000);
})
.catch((err) => {
    console.log(err);
})
