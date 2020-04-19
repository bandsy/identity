FROM node

RUN useradd -ms /bin/bash admin

WORKDIR /app
COPY . .

RUN chown -R admin:admin /app
RUN chmod 755 /app
USER admin

RUN yarn
RUN yarn build
EXPOSE 3000

ENTRYPOINT ["yarn", "run:prod"]
