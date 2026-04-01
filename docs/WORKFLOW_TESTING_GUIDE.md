# Local Testing Guide for GitHub Actions

## 🧪 Test Before You Deploy

**Never push untested workflows to GitHub!** Follow this checklist:

### 1. Install Act (Local GitHub Actions Runner)

```bash
# Windows (Chocolatey)
choco install act-cli

# Mac (Homebrew)
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

### 2. Quick Test Commands

```bash
# Test CI workflow (dry run)
act -j test-backend --dry-run
act -j test-frontend --dry-run

# Test deployment workflow (dry run - SAFE)
act -j ci-gate --dry-run
act -j deploy --dry-run

# Run actual tests (when dry-run passes)
act -j test-backend
act -j test-frontend
```

### 3. Pre-Push Checklist

- [ ] `act -j test-backend --dry-run` passes
- [ ] `act -j test-frontend --dry-run` passes  
- [ ] `act -j deploy --dry-run` passes
- [ ] All actual tests run locally: `act -j test-backend && act -j test-frontend`
- [ ] No syntax errors in YAML files
- [ ] All secrets are properly referenced (not hardcoded)

### 4. Common Issues & Fixes

#### Issue: "pnpm command not found"
```bash
# Fix: Ensure pnpm is in your workflow
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10
```

#### Issue: "Permission denied" for SSH
```bash
# Fix: Use proper SSH key handling
mkdir -p ~/.ssh
echo "${{ secrets.DEPLOY_SSH_KEY }}" > ~/.ssh/deploy_key
chmod 600 ~/.ssh/deploy_key
```

#### Issue: "Environment protection" errors
```bash
# Fix: Test with staging environment first
environment: staging  # Instead of production
```

### 5. Safe Deployment Flow

1. **Local Testing**: `./scripts/test-workflows.sh`
2. **Feature Branch**: `git checkout -b test-workflows`
3. **Push to Feature**: `git push origin test-workflows`
4. **Create PR**: Test in GitHub safely
5. **Merge to Main**: Only after PR passes

### 6. Emergency Rollback

If deployment fails:
```bash
# Quick rollback command
docker tag backup_YYYYMMDD_HHMMSS torqvio-backend:latest
docker-compose up -d backend
```

### 7. Monitoring

After deployment:
- Check logs: `docker logs torqvio-backend`
- Health check: `curl http://localhost:3001/health`
- Monitor: `docker ps`

## 🚨 Red Flags - STOP if you see these:

- ❌ `|| true` in test commands (hides failures)
- ❌ Hardcoded passwords/secrets
- ❌ No health checks after deployment
- ❌ No rollback mechanism
- ❌ Direct deployment on every push

## ✅ Green Flags - GOOD if you see these:

- ✅ Proper caching for speed
- ✅ Separate test and deploy jobs
- ✅ Environment protection
- ✅ Health checks and rollbacks
- ✅ Manual triggers for dangerous operations

## 🎯 Success Criteria

Your workflows are ready when:
1. All dry-runs pass without errors
2. Actual tests run successfully locally
3. Deployment has rollback protection
4. No client panic emails 🎉

---

**Remember:** Boring CI/CD is good CI/CD. If it's exciting, something's wrong!
