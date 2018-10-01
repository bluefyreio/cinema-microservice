<img src="https://bluefyre.blob.core.windows.net/images/bluefyre.logo.side.200by50.png" width="150"><br />
# Cinema Microservice App - Bluefyre's demo microservices app for k8


### Stack
We’ll use a simple NodeJS service with a MongoDB for our backend.
- NodeJS 8 LTS
- MongoDB 3.4.2

### Microservices

- [Movies Service example](./movies-service)
- [Cinema Catalog Service example](./cinema-catalog-service)
- [Booking Service example](./booking-service)
- [Payment Service example](./payment-service)
- [Notification Service example](./notification-service)
- [API Gateway Service example](./api-gateway)

### How to run the cinema microservice

- set up cloud builds of each of the services
```
cd k8
./run.sh
```

Follow the steps in k8/buildk8.sh to set up kubernetes elements
- Namespace
- set up secrets and configmaps
- set up mongo
- set up each of the services

Refer this [blog post](https://www.bluefyre.io/distributed-tracing-with-kubernetes-part1/) on Bluefyre on how to launch this microservices application on Kubernetes with Jaeger and Istio.

### CREDITS
Original work authored by [Cristian Ramirez](https://github.com/Crizstian/cinema-microservice/) as MIT licensed

### LICENSE
MIT
Copyright (c) 2018 Bluefyre
