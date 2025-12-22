# Config Directory

This directory contains **Sequelize CLI configuration** (CommonJS format).

## Why Two Config Files?

### `config/config.cjs` (This directory)
- **Purpose**: Sequelize CLI tool configuration
- **Used by**: `sequelize db:migrate` and `sequelize db:seed:all` commands
- **Format**: CommonJS (`require/module.exports`)
- **Extension**: `.cjs` (required because package.json has `"type": "module"`)
- **Why separate**: Sequelize CLI requires CommonJS format

### `src/config/db.js` (Application config)
- **Purpose**: Application runtime database connection
- **Used by**: Express server (`src/server.js`)
- **Format**: ES6 modules (`import/export`)
- **Why separate**: Application uses ES6 modules

Both are needed because:
- Sequelize CLI (migrations/seeders) requires CommonJS
- Application runtime requires ES6 modules

## Note on File Extensions

Since `package.json` has `"type": "module"`, all `.js` files are treated as ES modules.
- Config files for Sequelize CLI must use `.cjs` extension
- Seeder files must use `.cjs` extension
- Migration files can use `.js` but must use CommonJS syntax

