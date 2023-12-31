# linkShrink
URL shortener

This app can work in two modes: SSR (rendering pages for using own API) and service (for clients from outside).
App Info:
    - app can create short links from real links by adding new short link to the database and then redirecting user to real url when user trigger link with short url
    - app uses Postresql database (that is why we're using docker here - for running instance of db)
    - app uses TypeScript, Sequelize as ORM for Postgresql server, Express library as node server

0. For starting using this app we need to run in root folder of this project
 - start Docker container with docker-compose.yml file -> command: docker-compose up --build (build for first start)
 - install dependencies -> command: npm install
 - run project -> npm run start or use for production files in dist/ folder

1. a) For Rendering mode you just need to visit http://localhost:3000 - it will render starting page with form and list of the added items below where you can Add, Remove, Edit, Read new items with short links

1. b) For Using app as service use these endpoints from routes/main.ts file:
    
    - For adding new linkItem </br>
    router.post('/add', MainController.addNewLink);

    - Works for both modes - service and with server side rendering with redirection </br>
    router.get('/ls/:linkHash', MainController.checkLinkAndRedirect);

    - For service mode - for allowing getting list of linkShrink items by outer source </br>
    router.get('/getList', MainController.getList);

    - For removing item from the list </br>
    router.post('/remove/:linkId', MainController.removeLink);

    - For updating item in the list by id </br>
    router.put('/edit/:linkId', MainController.updateLink);
    
    - For rendering mode we use post due to html form </br>
    router.post('/edit/:linkId', MainController.updateLink);

P.S. After finishing work with app don't forget stop docker container and node server of course :-)


### Possible improvements:
- adding authorization
- adding pagination for list of items
- add better styling for rendered pages

### Part2 - What If: we need to scale our service for 10000 or 100000 requests per second
For scaling our app as service we can: <br/>
    - run multiple services with own instance of database on different servers if needed <br/>
    - create one service that will monitor databases load by requests and will redirect to special route for each instance of our service <br/>
    - buy better plan on azure :-)
