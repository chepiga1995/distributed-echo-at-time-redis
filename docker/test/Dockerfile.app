FROM node:10.14.2

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Copy files
ADD . /usr/src/app

ENV NODE_ENV=test

EXPOSE 8080
ENTRYPOINT [ "mocha" ]