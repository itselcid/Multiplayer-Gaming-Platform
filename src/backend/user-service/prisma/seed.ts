
import { prisma } from "../src/config/db";

const achievements = [
    { key: 'FIRST_WIN', name: 'Winner', description: 'Win your first match', icon: '🏆' },
    { key: 'CONSISTENT', name: 'Consistent', description: 'Play 10 matches', icon: '🎖️' },
    { key: 'ON_FIRE', name: 'On Fire', description: 'Win 3 matches in a row', icon: '🔥' },
    { key: 'FAMILY', name: 'Family', description: 'Add your first friend', icon: '🤝' },
    { key: 'FLAWLESS', name: 'Flawless', description: 'Win with 0 points conceded', icon: '💎' },
    { key: 'LEVEL_UP', name: 'Rising Star', description: 'No longer a beginner', icon: '⭐' }
];

async function main() {
    for (const a of achievements) {
        await prisma.achievement.upsert({
            where: { key: a.key },
            update: {},
            create: a,
        });
    }
    console.log('Achievements seeded successfully');
}

main();
