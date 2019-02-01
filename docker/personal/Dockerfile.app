FROM node:10.14.2

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm i -g nodemon

# Copy files
ADD . /usr/src/app

ENV NODE_ENV=personal

EXPOSE 8080
ENTRYPOINT [ "nodemon", "cluster.js", "--", "-i", "2" ]
