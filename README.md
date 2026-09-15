# QLSCvaQLBTI_BE

Bo khung backend co ban bang Node.js va Express de ban sua nhanh theo nhu cau.

## Cau truc thu muc

```text
QLSCvaQLBTI_BE/
|
|-- src/
|   |-- config/
|   |-- controllers/
|   |-- middlewares/
|   |-- models/
|   |-- routes/
|   |-- services/
|   |-- utils/
|   |
|   |-- app.js
|   `-- server.js
|
|-- .env
|-- .env.example
|-- .gitignore
|-- package.json
`-- README.md
```

## Cai dat

```bash
npm install
```

## Chay du an

```bash
npm run dev
```

hoac

```bash
npm start
```

## API mau

- `GET /` : kiem tra server dang chay
- `GET /api/health` : endpoint health check

## Noi can sua

- `.env`: sua ten app, port, bien moi truong
- `src/routes`: them route moi
- `src/controllers`: xu ly request/response
- `src/services`: viet business logic
- `src/models`: them model/schema khi ban co CSDL
