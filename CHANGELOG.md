# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-27

### Added
- Complete CLI interface with three core commands:
  - `hide`: Generates procedural nonograms, encrypts messages using AES-256-GCM, and embeds ciphertext via advanced LSB steganography in PNG images.
  - `reveal`: Extracts hidden data from PNG images and decrypts messages with integrity verification via GCM authentication tag.
  - `educate`: Displays comprehensive educational content on cryptography, steganography risks, password best practices, and privacy principles.
- Modular architecture with dedicated libraries:
  - `lib/encryption.js`: Secure AES-256-GCM implementation with PBKDF2 key derivation (100,000 iterations), random salt/IV, and self-contained buffer format.
  - `lib/steganography.js`: Robust LSB multi-bit embedding/extraction in PNG with capacity checks and 4-byte length header for blind recovery.
  - `lib/puzzleGenerator.js`: Procedural nonogram generation (5×5 to 50×50 grids) with automatic hint calculation and SVG-to-PNG rendering.
  - `lib/education.js`: Structured, standards-aligned educational content referencing NIST, ISO/IEC 27001, RFC 2898, and GDPR.
- Comprehensive test suite using Jest:
  - Advanced unit tests for encryption (integrity, non-determinism, avalanche effect).
  - Steganography resilience tests (capacity limits, recompression tolerance).
  - Puzzle generation validation and end-to-end integration flow.
- Professional documentation:
  - Detailed README with installation, usage examples, module explanations, dependency rationale, and technical design decisions.
  - JSDoc comments throughout the codebase for maintainability.

### Security
- Use of Node.js native `crypto` module for all cryptographic operations (no external dependencies).
- Authenticated encryption (AES-256-GCM) with explicit integrity checks.
- Educational warnings about steganography limitations and promotion of defense-in-depth principles.

This marks the initial stable release of PrivacyPuzzle, suitable for educational use, cybersecurity demonstrations, and portfolio showcasing.