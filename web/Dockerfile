# Use an official Python runtime as a parent image
FROM python:3.12-slim as backend

# Set the working directory in the container to /app
WORKDIR /app

# Add the current directory contents into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Use an official Node.js runtime as a parent image
FROM node:21-alpine3.19 as frontend

# Set the working directory in the container to /app/client
WORKDIR /app/client

# Add the current directory contents into the container at /app/client
ADD ./client /app/client

# Install any needed packages specified in package.json
RUN npm install

# Build the client application
RUN npm run build

# Final stage to setup the application
FROM backend as final

# Copy built static files from frontend
COPY --from=frontend /app/client/dist /app/client/dist

# Run the application when the container launches
CMD ["flask", "run", "--host=0.0.0.0"]