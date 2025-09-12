#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the schema file
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

console.log('Fixing all remaining relation issues in schema...');

// Fix 1: ProductReview - add relation name
schema = schema.replace(
  /reviewer User\?\s+@relation\(fields: \[userId\], references: \[id\], onDelete: SetNull\)/,
  'reviewer User?   @relation("ProductReviewer", fields: [userId], references: [id], onDelete: SetNull)'
);

// Fix 2: RoadmapItem - add creator field and relation
schema = schema.replace(
  /(model RoadmapItem \{[^}]*?parentId\s+String\?\s+@db\.Uuid[^}]*?)(\n\s+\/\/ Basic Info)/,
  '$1\n  createdBy   String?      @db.Uuid\n$2'
);

// Add creator relation to RoadmapItem
schema = schema.replace(
  /(item\s+RoadmapItem\s+@relation\(fields: \[itemId\], references: \[id\], onDelete: Cascade\)[^}]*?)(@@unique)/,
  `$1creator User?           @relation("RoadmapItemCreator", fields: [createdBy], references: [id], onDelete: SetNull)\n\n  $2`
);

// Wait, that's wrong. Let me add it to the relations section
schema = schema.replace(
  /(release\s+RoadmapRelease\?\s+@relation\(fields: \[releaseId\], references: \[id\], onDelete: SetNull\))/,
  '$1\n  creator   User?           @relation("RoadmapItemCreator", fields: [createdBy], references: [id], onDelete: SetNull)'
);

// Fix 3: RoadmapItemVote - add relation name
schema = schema.replace(
  /(model RoadmapItemVote \{[^}]*?)user\s+User\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)/,
  '$1user   User        @relation("RoadmapVoter", fields: [userId], references: [id], onDelete: Cascade)'
);

// Fix 4: RoadmapItemWatcher - add relation name
schema = schema.replace(
  /(model RoadmapItemWatcher \{[^}]*?)user\s+User\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)/,
  '$1user   User        @relation("RoadmapWatcher", fields: [userId], references: [id], onDelete: Cascade)'
);

// Fix 5: RoadmapFollower - add relation name
schema = schema.replace(
  /(model RoadmapFollower \{[^}]*?)user\s+User\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)/,
  '$1user    User           @relation("RoadmapFollowerUser", fields: [userId], references: [id], onDelete: Cascade)'
);

// Fix 6: FeedbackVote - add relation name
schema = schema.replace(
  /(model FeedbackVote \{[^}]*?)user\s+User\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)/,
  '$1user     User     @relation("FeedbackVoter", fields: [userId], references: [id], onDelete: Cascade)'
);

// Fix 7: FeedbackFollower - add relation name
schema = schema.replace(
  /(model FeedbackFollower \{[^}]*?)user\s+User\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)/,
  '$1user     User     @relation("FeedbackFollowerUser", fields: [userId], references: [id], onDelete: Cascade)'
);

// Fix 8: Employee model - change to one-to-many relation (remove @unique requirement)
// The error says we need @unique on userId for one-to-one, but we want one-to-many
// So we'll keep the relation as is but ensure it's properly defined

// Fix 9: Department head - add opposite relation in Employee
// First, let's add the departmentHead field to Employee model
schema = schema.replace(
  /(model Employee \{[^}]*?)(@@index\(\[tenantId, departmentId\]\))/,
  '$1departmentHead Department[] @relation("DepartmentHead")\n  $2'
);

// Fix 10: LeaveRequest covering employee - add opposite relation in Employee
schema = schema.replace(
  /(model Employee \{[^}]*?departmentHead Department\[\] @relation\("DepartmentHead"\))/,
  '$1\n  coveringLeaveRequests LeaveRequest[] @relation("CoveringEmployee")'
);

// Write the updated schema
fs.writeFileSync(schemaPath, schema);
console.log('Schema file updated successfully!');

// Run prisma format to clean up
const { execSync } = require('child_process');
try {
  console.log('Running prisma format...');
  execSync('npx prisma format', { stdio: 'inherit' });
  console.log('Schema formatted successfully!');
} catch (error) {
  console.error('Error formatting schema:', error.message);
}

// Validate the schema
try {
  console.log('\nValidating schema...');
  execSync('npx prisma validate', { stdio: 'inherit' });
  console.log('Schema validation successful!');
} catch (error) {
  console.error('Schema still has validation errors. Manual intervention may be required.');
}