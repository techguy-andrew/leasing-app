# Scripts Directory

This directory contains utility scripts for database operations and maintenance.

## Seed Default Tasks

The `seedDefaultTasks.ts` script adds default tasks to existing applications that don't have any tasks yet.

### Usage

Run the script using npm:

```bash
npm run seed:tasks
```

Or directly with tsx:

```bash
npx tsx scripts/seedDefaultTasks.ts
```

### What It Does

1. Connects to your database
2. Finds all applications
3. Checks which applications have no tasks
4. Adds 10 default tasks to each application without tasks
5. Skips applications that already have tasks (safe to run multiple times)
6. Shows a summary of what was updated

### Expected Output

```
🌱 Starting to seed default tasks...

📊 Found 25 total applications

⏭️  Skipping application 1 (John Doe) - already has 5 tasks
✅ Added 10 default tasks to application 2 (Jane Smith)
✅ Added 10 default tasks to application 3 (Bob Johnson)
...

============================================================
✨ Seeding complete!
📈 Statistics:
   - Applications updated: 23
   - Applications skipped: 2
   - Total applications: 25
   - Tasks added per application: 10
   - Total tasks created: 230
============================================================

🎉 Done!
```

### Customizing Default Tasks

Default tasks are defined in two places:

1. **For new applications**: `/src/lib/applicantDefaultTasks.ts`
   - Controls what tasks are added when creating new applications
   - See comments in that file for customization instructions

2. **For seeding existing applications**: `/scripts/seedDefaultTasks.ts`
   - Contains the same task list for consistency
   - Modify the `DEFAULT_TASKS` array to change what gets seeded

### Safety Features

- **Idempotent**: Safe to run multiple times - won't duplicate tasks
- **Non-destructive**: Only adds tasks, never removes or modifies existing ones
- **Transactional**: Uses database transactions to ensure data consistency
- **Informative**: Provides detailed output about what was changed

### Troubleshooting

**Error: "Cannot find module 'tsx'"**
```bash
npm install -D tsx
```

**Error: "Cannot find module '@prisma/client'"**
```bash
npm install
npx prisma generate
```

**Database connection errors**
- Ensure your `.env` file is configured correctly
- Check that your database is running
- Verify DATABASE_URL is set properly
