"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Checking existing users...\n');
    // Check existing users
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            displayName: true,
            createdAt: true,
        }
    });
    if (users.length > 0) {
        console.log('Existing users:');
        users.forEach(user => {
            console.log(`- Email: ${user.email}, Name: ${user.displayName || 'N/A'}, Created: ${user.createdAt}`);
        });
        console.log('\nYou can sign in with any of these emails.');
    }
    else {
        console.log('No users found in database.');
    }
    // Create a test user if none exist
    if (users.length === 0) {
        console.log('\nCreating test user...');
        const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
        const testUser = await prisma.user.create({
            data: {
                email: 'test@example.com',
                password: hashedPassword,
                displayName: 'Test User',
            },
        });
        console.log('Test user created:');
        console.log('Email: test@example.com');
        console.log('Password: password123');
    }
    else {
        // Update password for first user to known value
        console.log('\nResetting password for first user to enable login...');
        const firstUser = users[0];
        const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
        await prisma.user.update({
            where: { id: firstUser.id },
            data: { password: hashedPassword },
        });
        console.log(`\nPassword reset for user: ${firstUser.email}`);
        console.log('New password: password123');
        console.log('\nYou can now sign in with:');
        console.log(`Email: ${firstUser.email}`);
        console.log('Password: password123');
    }
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
