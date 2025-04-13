# Position Book Management System

A real-time position management system for trading securities, built with Spring Boot and React.

## Project Structure

```
position-book-system/
├── backend/           # Spring Boot backend
│   └── src/
│       └── main/
│           └── java/
│               └── com/
│                   └── positionbook/
│                       ├── controller/
│                       ├── model/
│                       └── service/
└── frontend/         # React frontend
    └── src/
        ├── components/
        └── services/
```

## Features

- Real-time position tracking
- Support for BUY, SELL, and CANCEL trade events
- In-memory position book management
- REST API endpoints with Swagger documentation
- Modern React UI with Material-UI
- Auto-refreshing position summary
- Form validation
- Error handling

## Prerequisites

- Java 17 or higher
- Node.js 14 or higher
- npm or yarn

## Setup & Running

### Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build the project:
   ```bash
   ./mvnw clean install
   ```

3. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

The backend will start on http://localhost:8080

### Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will start on http://localhost:3000

## API Documentation

The application includes comprehensive API documentation using Swagger (OpenAPI). You can access the documentation through:

- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

The Swagger UI provides:
- Interactive API documentation
- Try-it-out functionality for testing endpoints
- Detailed request/response schemas
- Authentication information (if applicable)

## API Endpoints

All API endpoints are documented in the Swagger UI. Here are some key endpoints:

### POST /api/events
Submit one or more trade events.

Example request body:
```json
[
  {
    "id": "trade123",
    "action": "BUY",
    "account": "ACC001",
    "security": "AAPL",
    "quantity": 100
  }
]
```

### GET /api/positions
Retrieve all current positions.

Example response:
```json
[
  {
    "account": "ACC001",
    "security": "AAPL",
    "totalQuantity": 100,
    "activeEvents": [
      {
        "id": "trade123",
        "action": "BUY",
        "account": "ACC001",
        "security": "AAPL",
        "quantity": 100,
        "active": true
      }
    ]
  }
]
```

## Testing

The application includes several test scenarios:

1. Buying multiple quantities of the same security for the same account
2. Buying different securities across different accounts
3. Buying and selling of the same security
4. Canceling previously submitted events

To run tests:

Backend:
```bash
cd backend
./mvnw test
```

Frontend:
```bash
cd frontend
npm test
```
