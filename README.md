# NodeAPI Base
an Apollo server using expressMiddleware and Web Sockets.
Passport jwt for authentication
Apollo GraphQL with web Socket Server for GraphQL Subscriptions.
ORM (Object-relational Mapper) MSSQL -- Sequelize


## Setup

Edit the .env
```
# Make sure this is false whe running in Production
DEVELOPMENT = false 
USER_REGISTRATION="true"
# SUPER ADMIN ACCOUNT (DELETE These lines to remove)
# bcrypt.hash Cost Factor(10) -- https://bcrypt.online/
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = '$2y$10$UAetiq2RWOuYKOxtxRvs4./UDxWVf02sT/9WgijDH.MzZ746P85Iy' # myAdminPassword
# Host CONFIG
HOST = 'https://localhost'
LISTENING_ADDR = '0.0.0.0'
LISTENING_PORT = 4000
# SSL CONFIG
#SSL_KEY = 'sslCerts/key.pem'
#SSL_CERT = 'sslCerts/key.pem'
UPLOAD_SIZE_LIMIT = '50mb'
# SQL CONFIG
SQL_HOST = 'localhost'
SQL_PORT = '1433'
SQL_DB_NAME = 'test'
SQL_DB_USER = 'sa'
SQL_DB_PASSWORD = 'db-password'
DEV_MODE = true
# Create a new JWT secret with `node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"`
JWT_SECRET = 
```

## Docker

```
sudo docker build . -t image-name
sudo docker run -p 4000:4000 -d image-name
docker run -p 4000:4000 -d --restart unless-stopped treestock-dev

docker ps
docker logs <container id>
docker stop <container id>
sudo netstat -lntup
```




##NodeJS -- Production
### Read this
https://maximorlov.com/start-node-js-in-production/


#### Docker 
https://nodejs.org/en/docs/guides/nodejs-docker-webapp

#### PM2 - PM2 is a daemon process manager that will help you manage and keep your application online 24/7
https://pm2.keymetrics.io/




## sequelize DB --
https://sequelize.org/docs/v6/core-concepts/model-basics/

## sequelize <--> graphql
https://www.npmjs.com/package/graphql-sequelize




### Look into
### Apollo Server might be a good option if we want to use GraphQL Subscripts -- Just need to make sure the Auth Methods we have already developed work

https://www.apollographql.com/docs/apollo-server/
https://www.apollographql.com/docs/react/
https://www.apollographql.com/docs/apollo-server/security/authentication

### >>>>>> HELP LINKS <<<<<< ###
https://www.apollographql.com/docs/apollo-server/schema/schema/
https://www.apollographql.com/docs/apollo-server/api/express-middleware/
