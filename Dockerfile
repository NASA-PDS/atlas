############################
# Builder
############################

FROM node:lts-jod AS builder

# Add git
RUN apt-get update \
 && apt-get install -y git

# Create app directory
WORKDIR /usr/src/app

# Bundle entire app source
COPY . .

RUN npx browserslist@latest --update-db

# Force production env
RUN npm ci NODE_ENV=production

# Build client and server
RUN npm run build


#############################
# Switch to Atlas Documentation project
#############################

# Bundle entire app source
COPY ./Documentation /usr/src/app/Documentation

WORKDIR /usr/src/app/Documentation

RUN npm ci NODE_ENV=production
RUN npm run build

########################################
# Switch to Atlas project
########################################
WORKDIR /usr/src/app/

############################
# Runner
############################

FROM node:lts-jod AS runner

# Create app directory
WORKDIR /usr/src/app

# Contains script macros and metadata
COPY package*.json ./

COPY config/paths.js config/package.json ./config/
COPY scripts/start-prod.js scripts/package.json ./scripts/

# Not all server side packages get bundled
RUN npm ci NODE_ENV=production

# All our needed scripts neatly come from here
COPY --from=builder /usr/src/app/build ./build

EXPOSE 8500
CMD [ "npm", "run", "start:prod" ]
