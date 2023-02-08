FROM node:18.12.1-bullseye

# the WORKDIR within the container
WORKDIR /usr/src/web_client_src

# the COPY from path is relative to the build context, not to the Dockerfile
COPY package.json package-lock.json ./
RUN npm install

RUN apt-get update -y
RUN apt-get install -y binutils libproj-dev gdal-bin

# These are non essential libraries
# RUN apt-get install -y net-tools

COPY ./ ./
RUN npm run build  # the build step needs all the files in the container to be present so it can't be done as a postinstall step in package.json

# chmod +x makes the entrypoint.sh file executable (it gets execute permissions)
RUN chmod +x dev_container/entrypoint.sh

ENTRYPOINT ["dev_container/entrypoint.sh"]