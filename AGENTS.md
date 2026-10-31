## Branch and deployment workflow

- Develop and commit changes on `dev`, including documentation and fixes. Start from the latest `main` without rewriting shared history.
- Validate each small change before merging `dev` into `main`. Production is deployed only from `main`, never directly from `dev`.
- Preserve other contributors' changes. Verify remote state, back up production and validate recovery before deploying; never overwrite runtime data with repository files.
- Follow `docs/RELEASE-WORKFLOW.md`. Leave the local checkout on `dev` after completing a release.

## Optional Feature Guides

When users request features beyond the base template, check for available recipes in `.kilocode/recipes/`.

### Available Recipes

| Recipe       | File                                | When to Use                                           |
| ------------ | ----------------------------------- | ----------------------------------------------------- |
| Add Database | `.kilocode/recipes/add-database.md` | When user needs data persistence (users, posts, etc.) |

### How to Use Recipes

1. Read the recipe file when the user requests the feature
2. Follow the step-by-step instructions
3. Update the memory bank after implementing the feature

## Memory Bank Maintenance

After completing the user's request, update the relevant memory bank files:

- `.kilocode/rules/memory-bank/context.md` - Current state and recent changes
- Other memory bank files as needed when architecture, tech stack, or project goals change
