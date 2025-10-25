# DEVSEN API - Copilot Instructions

## Architecture Overview

This is a **gateway-proxied REST API** built with Express/ES6 that acts as a middle layer between clients and an external PHP gateway service. The API doesn't use a database directly - all data operations are proxied through HTTP calls to `gateway_url:gateway_port` endpoints.

### Key Architectural Patterns

**Gateway Proxy Pattern**: All business logic resides in external PHP services. Node.js API serves as:
- Authentication/authorization layer (currently hardcoded admin mode)
- Request validation and data transformation
- Logging and middleware processing
- HTTP proxy to `src/models/gateway.js`

**Model → Gateway Flow**: 
```
API Route → Model Class → Gateway.request() → External PHP Service
```

Example: `customers.js` → `Customers.addCustomer()` → `GATEWAY.addCustomer()` → `http://gateway.svi:96/addCustomer.php`

## Environment & Configuration

**Multi-environment setup** via `NODE_ENV`:
- `config.json` (development)
- `config.staging.json` 
- `config.production.json`

Config is loaded at module level:
```javascript
const config = process.env.NODE_ENV==='production' ? require("./config.production.json") : ...
```

**Critical config values**:
- `gateway_url`/`gateway_port`: External service endpoints
- `admin_token`: Hardcoded auth bypass (see middleware)
- Database settings (currently commented out in `db.js`)

## Development Workflow

**Start development**: `npm run dev` (uses nodemon + babel-node)
**Build**: `npm run build` (Babel ES6→ES5 compilation to `dist/`)
**Production**: `npm start` (runs compiled code)
**Lint**: `npm test` (eslint only, no actual tests)

**File structure**:
- `src/api/*.js` - Route handlers using `resource-router-middleware`
- `src/models/*.js` - Business logic classes that proxy to gateway
- `src/middleware/index.js` - Auth middleware (currently hardcoded)
- `src/config*.json` - Environment-specific settings

## Authentication & Security

**Current auth state**: Hardcoded admin bypass in `middleware/index.js`:
```javascript
req.user = {admin:true};
req.user.access_token = 'access_token';
```

Real JWT verification is commented out. All routes expect `req.user.access_token` for gateway calls.

**Security middlewares**: Helmet, CORS, XSS protection, rate limiting, HSTS configured in `index.js`

## API Patterns

**Resource routing**: Uses `resource-router-middleware` for RESTful patterns:
```javascript
export default ({ config, db, logger }) => resource({ id: 'customers' })
.post('/add', ...)
.get('/get/:name_customer', ...)
```

**Error handling**: Consistent pattern with callback `(error, response)` signature reversed in gateway calls

**Request validation**: Manual validation in route handlers, not centralized schema validation

## Gateway Integration

**HTTP methods**: 
- POST requests use `request2()` with form data
- GET requests use `request()` with query parameters
- Authentication via `Authorization: Bearer` headers

**Gateway endpoints**:
- `/addCustomer.php`, `/updateCustomer.php`, `/getCustomer.php`
- `/addOrder.php`, `/getOrdersByCustomer.php`, `/updateOrderStatus.php`

## Logging

**Winston setup**: Daily rotating files in `src/log/` directory
```javascript
logger.log({ level: 'debug', message: 'your message' });
```

## Common Issues & Gotchas

1. **Gateway down**: No circuit breaker - API will hang/timeout on gateway failures
2. **Config loading**: Happens at require time, not runtime - server restart needed for config changes
3. **Database unused**: `db.js` connection is commented out but still passed to all modules
4. **Auth bypass**: Current middleware allows all requests through with fake admin user
5. **Error inconsistency**: Some callbacks use `(response, error)`, others `(error, response)`

## Adding New Endpoints

1. Create route in `src/api/[resource].js` using resource-router-middleware
2. Add model class in `src/models/` with gateway proxy methods
3. Add corresponding gateway methods in `src/models/gateway.js`
4. Update `src/api/index.js` to register new route
5. Ensure external PHP endpoint exists on gateway server

## Code Style

- ES6 imports/exports mixed with CommonJS requires
- Function declarations over arrow functions in classes
- Manual parameter extraction and validation in routes
- Callback pattern over promises/async-await