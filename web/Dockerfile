# build the frontend
FROM node:21-alpine3.19 as frontend

WORKDIR /app/client

COPY ./client /app/client

RUN npm install
RUN npm run build

# build the backend
FROM python:3.12-slim as backend

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# build the final app
FROM backend as final

COPY --from=frontend /app/client/dist /app/client/dist

CMD ["gunicorn", "--bind=0.0.0.0:5000", "app:app"]