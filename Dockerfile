FROM node:12.16.2-alpine

LABEL "com.github.actions.name"="organization-membership-action"
LABEL "com.github.actions.description"="Manage your Github organization/teams membership with pull requests!"
LABEL "com.github.actions.icon"="users"
LABEL "com.github.actions.color"="green"
LABEL "repository"="https://github.com/johnmartel/organization-membership-action"
LABEL "homepage"="https://github.com/johnmartel/organization-membership-action"
LABEL "maintainer"="John Martel <jonathan.martel@coglinc.ca>"

COPY package.json .
COPY package-lock.json .
COPY tsconfig.json .
COPY src ./src

RUN npm install --production
RUN npx -p typescript@$(node -p "require('./package.json').devDependencies.typescript") tsc

ENTRYPOINT ["node", "/lib/index.js"]
