# we use node v14 as our base image

FROM node:16

# WORKDIR instruction sets the working directory for any RUN, CMD, ENTRYPOINT, COPY and ADD instructions that follow it in the Dockerfile.
# If WORKDIR is not present, it's like RUN mkdir producer && cd producer and if already present it's like cd producer

WORKDIR /node-mail-service

# copying package.json(file path wrt to our Dockerfile) from host to container path wrt WORKDIR(/producer), you can use ADD too but copy is recommended

COPY ./mail-service/package.json .

# installing all dependencies. RUN Builds a new layer over an existing image by committing the results.

RUN npm install

# copying rest of the code fileS from host(/Producer) to container(/producer)
# First . represents location of our code file wrt our Dockerfile, while the second . represents path wrt WORKDIR(/producer)

COPY /mail-service .

# CMD takes in our command as an array. For each Dockerfile we should have only 1 CMD else all other CMD expect the last one are ignored.

CMD ["node", "index.js"]