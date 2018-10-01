#FROM golang:onbuild
#EXPOSE 3000

# build stage
FROM golang:alpine AS build-env
ADD . /src
RUN apk add --no-cache git
RUN go get github.com/gorilla/mux
RUN go get github.com/gorilla/securecookie
RUN cd /src && go build -o login-service

# final stage
FROM alpine
WORKDIR /app
COPY --from=build-env /src/login-service /app/
ENTRYPOINT ./login-service