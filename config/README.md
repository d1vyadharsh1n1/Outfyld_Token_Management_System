# Config Directory

This directory contains **Sequelize CLI configuration** (CommonJS format).

## Why Two Config Files?

### `config/config.js` (This directory)
- **Purpose**: Sequelize CLI tool configuration
- **Used by**: `sequelize db:migrate` command
- **Format**: CommonJS (`require/module.exports`)
- **Why separate**: Sequelize CLI requires CommonJS format

### `src/config/db.js` (Application config)
- **Purpose**: Application runtime database connection
- **Used by**: Express server (`src/server.js`)
- **Format**: ES6 modules (`import/export`)
- **Why separate**: Application uses ES6 modules

Both are needed because:
- Sequelize CLI (migrations) requires CommonJS
- Application runtime requires ES6 modules

