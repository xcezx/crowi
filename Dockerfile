FROM node:4.7-alpine

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN apk add --no-cache --virtual .build-dep \
        g++ \
        git \
        make \
        python \
    && npm install -g npm@3.x \
    && npm install --production --unsafe-perm \
    && npm cache clean \
    && apk del .build-dep \
    && rm -rf /tmp/npm*

EXPOSE 3000

CMD ["npm", "start"]
