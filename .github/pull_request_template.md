## Description
<!-- What does this PR do? Why? -->

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Refactor / cleanup
- [ ] Documentation
- [ ] CI/CD / DevOps

## Testing
- [ ] `php artisan test` passes locally
- [ ] `pytest test_grader.py -v` passes locally (if grader changed)
- [ ] `npx tsc --noEmit` passes (if frontend changed)
- [ ] Tested in browser / Postman

## Checklist
- [ ] Migrations are reversible (`down()` implemented)
- [ ] No secrets or `.env` values committed
- [ ] API changes are reflected in `src/api/` and `src/types/index.ts`
- [ ] New routes have appropriate middleware (`auth:sanctum`, `role:teacher`)
