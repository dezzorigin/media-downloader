# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial Next.js project setup for Media Downloader
- Multi-provider download support (Cloudflare, AWS, local)
- Concurrent download queue management
- Progress tracking with visual progress bars
- Magnet link support for torrents

### Changed
- Updated Next.js and dependencies to latest stable versions
- Improved download worker performance
- Enhanced error handling for failed downloads
- Optimized storage cleanup routines

### Fixed
- Fixed concurrent download limit bugs
- Fixed progress bar stalling issues
- Fixed magnet link parsing errors

### Security
- Updated dependency versions to patch vulnerabilities
- Fixed path traversal vulnerabilities in download handling

## [1.0.0] - 2024-11-05

### Added
- Initial Media Downloader setup
- Multi-provider download architecture
- Download queue management system
- Progress tracking UI
- Magnet link parser
