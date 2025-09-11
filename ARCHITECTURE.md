# VideoChat Pro - Architecture Documentation

## Project Structure

```
chat_call_proj/
├── src/
│   ├── server/                 # Backend code
│   │   ├── app.js             # Main server application
│   │   ├── handlers/          # Socket event handlers
│   │   │   └── socketHandler.js
│   │   └── services/          # Business logic services
│   │       ├── roomManager.js
│   │       └── userManager.js
│   ├── client/                # Frontend code
│   │   └── js/
│   │       ├── app.js         # Main client application
│   │       ├── modules/       # Feature modules
│   │       │   ├── webrtcManager.js
│   │       │   ├── chatManager.js
│   │       │   └── uiManager.js
│   │       └── utils/         # Utility functions
│   │           ├── constants.js
│   │           ├── eventEmitter.js
│   │           └── domUtils.js
│   └── shared/                # Shared code between client/server
│       └── types.js
├── public/                    # Static assets
│   ├── css/
│   ├── js/ (legacy)
│   └── index.html
└── server.js                 # Entry point
```

## Architecture Principles

### 1. Separation of Concerns
- **Server**: Handles WebSocket connections, room management, user management
- **Client**: Manages UI, WebRTC connections, chat functionality
- **Shared**: Common types and constants

### 2. Modular Design
Each module has a single responsibility:
- `WebRTCManager`: Handles peer-to-peer connections
- `ChatManager`: Manages chat messages and state
- `UIManager`: Controls DOM manipulation and user interactions
- `RoomManager`: Server-side room operations
- `UserManager`: Server-side user operations

### 3. Event-Driven Architecture
- Uses custom EventEmitter for loose coupling
- Clear event flow between modules
- Consistent event naming conventions

### 4. Error Handling
- Centralized error handling in each module
- Graceful degradation for media access failures
- Connection state monitoring

## Key Components

### Server Side

#### SocketHandler
- Manages all WebSocket events
- Delegates to appropriate services
- Maintains clean separation between transport and business logic

#### RoomManager
- Handles room creation/deletion
- Manages user-room relationships
- Provides room statistics

#### UserManager
- Tracks connected users
- Manages user metadata
- Handles user cleanup on disconnect

### Client Side

#### WebRTCManager
- Manages local media streams
- Handles peer connections
- Provides media control methods

#### ChatManager
- Manages message history
- Handles unread message counting
- Provides chat state management

#### UIManager
- Handles all DOM operations
- Manages UI state transitions
- Provides user interaction handling

## Data Flow

1. **User Joins Room**:
   ```
   UI → App → Socket → Server → RoomManager → All Clients
   ```

2. **WebRTC Connection**:
   ```
   WebRTCManager → Socket → Peer WebRTCManager → Media Stream
   ```

3. **Chat Message**:
   ```
   UI → ChatManager → Socket → Server → All Room Members
   ```

## Benefits of This Structure

1. **Maintainability**: Clear module boundaries make code easier to understand and modify
2. **Testability**: Each module can be tested independently
3. **Scalability**: Easy to add new features without affecting existing code
4. **Reusability**: Modules can be reused in different contexts
5. **Debugging**: Issues can be isolated to specific modules
6. **Code Quality**: Consistent patterns and error handling throughout

## Development Guidelines

1. **Module Independence**: Each module should be self-contained
2. **Event Naming**: Use consistent event naming from constants
3. **Error Handling**: Always handle errors gracefully
4. **Documentation**: Keep this architecture doc updated
5. **Testing**: Write tests for each module
6. **Code Style**: Follow ESLint configuration