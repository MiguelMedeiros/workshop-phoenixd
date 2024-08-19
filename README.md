# 🛠️ PhoenixD Server Workshop
https://github.com/user-attachments/assets/3dcdf691-3bab-4606-a6a5-ab43f7585978


This project sets up a PhoenixD server with a backend and frontend, all managed through Docker Compose.

## Architecture
- **PhoenixD**: A decentralized, secure, and scalable blockchain platform.
- **Backend**: A REST API that interacts with the PhoenixD node.
- **Frontend**: A web interface that displays the latest blocks and transactions.

![Architecture](https://github.com/user-attachments/assets/609414f1-ac99-4b4a-9bbb-4ee6d46d6bad)

## 🚀 Quick Start with Docker Compose

### Requirements
- Docker and Docker Compose installed.

### Instructions
1. Clone the Repository:
```bash
git clone --recurse-submodules <repo-url>
cd workshop
```

2. Configure Environment Variables:

    2.1 For the backend `0_backend/.env`:
    ```
    PORT=4269
    PHOENIX_TOKEN= (set this to the http-password from 3_phoenixd/phoenix.conf)
    PHOENIX_HOST=http://phoenixd:9740
    ```

    2.2 For the frontend `1_frontend/.env`:
    ```
    NEXT_PUBLIC_BACKEND_URL=https://workshop-backend.miguelmedeiros.dev
    NEXT_PUBLIC_LIMIT_MESSAGES=5
    ```

3. Start the Services:
```bash
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