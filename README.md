# 🛠️ PhoenixD Workshop
<video width="100%" controls>
  <source src="./4_docs/presentation.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>


## Project Description

This project sets up a PhoenixD server with a backend and frontend, all managed through Docker Compose.

## 🚀 Quick Start with Docker Compose

### Requirements
- Docker and Docker Compose installed.

### Instructions
1. Clone the Repository:
```
git clone --recurse-submodules <repo-url>
cd workshop
```

2. Configure Environment Variables:

    2.1 For the backend (0_backend/.env):
    ```
    PORT=4269
    PHOENIX_TOKEN= (set this to the http-password from 3_phoenixd/phoenix.conf)
    PHOENIX_HOST=http://phoenixd:9740
    ```

    2.2 For the frontend (1_frontend/.env):
    ```
    NEXT_PUBLIC_BACKEND_URL=https://workshop-backend.miguelmedeiros.dev
    NEXT_PUBLIC_LIMIT_MESSAGES=5
    ```

3. Start the Services:
```
docker-compose up --build
```

4. Access the Frontend:
    - Open your browser and go to http://localhost:3005

## 📁 About the 3_phoenixd Directory
- `phoenix.conf`: Configuration file. Manually copy the http-password into the backend's .env file as PHOENIX_TOKEN.
- `seed.dat`: This is your seed. Be careful with this file! Make sure to back it up.
- `phoenix.mainnet.`: This is your database.

## 📄 License
This project is licensed under the [MIT LICENSE](./LICENSE).