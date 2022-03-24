FROM node:16-alpine3.11

RUN apk add ffmpeg python2 opus g++ make libtool libc6-compat

RUN apk --no-cache add msttcorefonts-installer fontconfig && \
    update-ms-fonts && \
    fc-cache -f

WORKDIR /usr/src/bot
COPY package.json ./
COPY yarn.lock ./
# --ignore-optional --ignore-engines --production
RUN yarn install || \
  ((if [ -f yarn-error.log ]; then \
      cat yarn-error.log; \
    fi) && false)

COPY . .

RUN yarn build

CMD node build/src/index.js
