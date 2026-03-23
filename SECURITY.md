# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| latest  | Yes       |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

To report a vulnerability:

1. Email the maintainers directly (add your security contact email here)
2. Include as much detail as possible:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Any suggested fix (optional)

We will acknowledge your report within **48 hours** and aim to release a fix within **14 days** for critical issues.

You will be credited in the release notes if you wish.

## Scope

The following are in scope:
- Authentication and authorization bypasses
- SQL injection, XSS, CSRF
- Remote code execution
- Sensitive data exposure
- Security misconfigurations in the Docker/Nginx setup

Out of scope:
- Issues in third-party dependencies (report to the dependency maintainer)
- Social engineering attacks
- Physical security
