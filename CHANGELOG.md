# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-12-11

### Added
- **TypeScript Support**: Full TypeScript definitions in `index.d.ts`
- **Collaborative Mouse Tracker Example**: Beautiful real-time demo showcasing express-longpoll capabilities
- **ESLint Configuration**: Code quality and consistency checks
- **Prettier Configuration**: Automatic code formatting
- **Enhanced Documentation**: Improved README with best practices and troubleshooting
- **Node.js Version Requirement**: Explicitly require Node.js >= 14.0.0

### Changed
- **Updated Dependencies**: 
  - `eventemitter2` from 3.0.0 to ^5.0.1
  - `lodash` minimum version to 4.17.21 (security fix)
  - Updated all dev dependencies to latest versions
- **Improved .npmignore**: Better exclusion of development files from npm package
- **Enhanced package.json**: Added keywords, engines, and better scripts

### Fixed
- **Memory Leak Prevention**: Better handling of EventEmitter listeners (addresses Issue #12)
- **Security**: Updated lodash to address security vulnerabilities

### Developer Experience
- Added `test:watch` script for continuous testing
- Added `lint` and `lint:fix` scripts
- Added `format` script for code formatting
- Improved test structure and coverage

### Breaking Changes
- **None**: Full backward compatibility maintained with v0.0.6

### Migration Guide
No changes required! Simply update your package.json:
```json
{
  "dependencies": {
    "express-longpoll": "^1.0.0"
  }
}
```

## [0.0.6] - 2019-01-15

### Initial Release
- Basic long polling functionality
- Promise-based API
- Support for Express routers
- Middleware support
- Event-based architecture with EventEmitter2
