#Api-Gateway

cd /home/josh/IdeaProjects/event-Registration-System/api-gateway
docker build -t api-gateway:latest .

docker run -d -p 8080:8080 \
  --add-host host.docker.internal:host-gateway \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://host.docker.internal:8761/eureka/ \
  --name api-gateway api-gateway:latest

#Auth-service

docker run -d -p 8081:8081 \
  --add-host host.docker.internal:host-gateway \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://host.docker.internal:8761/eureka/ \
  --name auth-service auth-service:latest

#Event-service

cd /home/josh/IdeaProjects/event-Registration-System/event-service
docker build -t event-service:latest .

docker run -d -p 8082:8082 \
  --add-host host.docker.internal:host-gateway \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://host.docker.internal:8761/eureka/ \
  --name event-service event-service:latest

#Registration-service

cd /home/josh/IdeaProjects/event-Registration-System/registration-service
docker build -t registration-service:latest .

docker run -d -p 8083:8083 \
  --add-host host.docker.internal:host-gateway \
  -e EUREKA_CLIENT_SERVICEURL_DEFAULTZONE=http://host.docker.internal:8761/eureka/ \
  --name registration-service registration-service:latest

#service-registery

docker build -t service-registry:latest .

docker run -d -p 8761:8761 --name service-registry service-registry:latest

