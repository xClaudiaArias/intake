const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const staffPasswordHash = await bcrypt.hash('StaffDemo123!', 12);
  const patientPasswordHash = await bcrypt.hash('PatientDemo123!', 12);

  await prisma.user.upsert({
    where: { email: 'nurse@demo-clinic.test' },
    update: {},
    create: {
      email: 'nurse@demo-clinic.test',
      passwordHash: staffPasswordHash,
      role: 'STAFF',
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@demo-clinic.test' },
    update: {},
    create: {
      email: 'patient@demo-clinic.test',
      passwordHash: patientPasswordHash,
      role: 'PATIENT',
      patientProfile: {
        create: {
          name: 'Jamie Rivera',
          dob: new Date('1990-04-12'),
          phone: '555-0100',
        },
      },
    },
    include: { patientProfile: true },
  });

  // A handful of open slots over the next few days
  const now = new Date();
  for (let dayOffset = 1; dayOffset <= 3; dayOffset++) {
    for (const hour of [9, 10, 11, 14, 15]) {
      const start = new Date(now);
      start.setDate(start.getDate() + dayOffset);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setMinutes(30);

      await prisma.slot.create({
        data: { startTime: start, endTime: end, isAvailable: true },
      });
    }
  }

  console.log('Seed complete. Demo logins:');
  console.log('  Staff:   nurse@demo-clinic.test / StaffDemo123!');
  console.log('  Patient: patient@demo-clinic.test / PatientDemo123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
