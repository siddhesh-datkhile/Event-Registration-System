# 1. Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and download dependencies to get a cached layer
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code and build
COPY src ./src
RUN mvn clean package -DskipTests

# 2. Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/service-registry-0.0.1-SNAPSHOT.jar app.jar

# Expose the port configured in application.properties
EXPOSE 8761

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
