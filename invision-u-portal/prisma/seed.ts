import { ApplicationStatus, PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + (n % 5), (n * 7) % 60, 0, 0);
  return d;
}

function todayAt(h: number, m: number): Date {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

async function main() {
  await prisma.evaluation.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.user.deleteMany();

  const adminHash = bcrypt.hashSync("hackathon2026", 10);
  const applicantSeedPw = bcrypt.hashSync("ApplicantSeed123!", 10);

  await prisma.user.create({
    data: {
      email: "admin@invision-u.kz",
      passwordHash: adminHash,
      role: UserRole.ADMIN,
      fullName: "Committee Admin",
    },
  });

  const specs = [
    {
      fullName: "Айгерим Нурланова",
      email: "a.nurlanova@mail.kz",
      phone: "+7 700 111 2233",
      iin: "010101123456",
      appliedAt: todayAt(9, 15),
      total: 92,
      l: 90,
      p: 88,
      s: 94,
      per: 91,
      anti: 12,
    },
    {
      fullName: "Данияр Омаров",
      email: "d.omarov@gmail.com",
      phone: "+7 701 222 3344",
      iin: "020202234567",
      appliedAt: todayAt(11, 40),
      total: 87,
      l: 85,
      p: 90,
      s: 82,
      per: 86,
      anti: 18,
    },
    {
      fullName: "Сабина Жумабекова",
      email: "s.zhuma@mail.ru",
      phone: "+7 702 333 4455",
      iin: "030303345678",
      appliedAt: todayAt(14, 5),
      total: 84,
      l: 80,
      p: 86,
      s: 88,
      per: 79,
      anti: 22,
    },
    {
      fullName: "Ерлан Касымов",
      email: "e.kasym@inbox.kz",
      phone: "+7 703 444 5566",
      iin: "040404456789",
      appliedAt: daysAgo(1),
      total: 76,
      l: 78,
      p: 74,
      s: 72,
      per: 80,
      anti: 28,
    },
    {
      fullName: "Мариям Сейтова",
      email: "m.seitova@yandex.kz",
      phone: "+7 704 555 6677",
      iin: "050505567890",
      appliedAt: daysAgo(2),
      total: 45,
      l: 42,
      p: 48,
      s: 44,
      per: 46,
      anti: 55,
    },
    {
      fullName: "Асылбек Рахимов",
      email: "a.rakhim@gmail.com",
      phone: "+7 705 666 7788",
      iin: "060606678901",
      appliedAt: daysAgo(3),
      total: 63,
      l: 60,
      p: 65,
      s: 62,
      per: 64,
      anti: 35,
    },
    {
      fullName: "Камила Тлеубергенова",
      email: "k.tileu@mail.kz",
      phone: "+7 706 777 8899",
      iin: "070707789012",
      appliedAt: daysAgo(5),
      total: 38,
      l: 35,
      p: 40,
      s: 36,
      per: 42,
      anti: 62,
    },
    {
      fullName: "Нурбек Ибраев",
      email: "n.ibraev@list.ru",
      phone: "+7 707 888 9900",
      iin: "080808890123",
      appliedAt: daysAgo(7),
      total: 71,
      l: 73,
      p: 68,
      s: 70,
      per: 72,
      anti: 30,
    },
    {
      fullName: "Алина Мухтарова",
      email: "a.mukhtarova@gmail.com",
      phone: "+7 708 999 0011",
      iin: "090909901234",
      appliedAt: daysAgo(10),
      total: 55,
      l: 52,
      p: 58,
      s: 54,
      per: 56,
      anti: 40,
    },
    {
      fullName: "Тимур Валиев",
      email: "t.valiev@mail.kz",
      phone: "+7 709 000 1122",
      iin: "101010012345",
      appliedAt: daysAgo(14),
      total: 89,
      l: 88,
      p: 90,
      s: 86,
      per: 89,
      anti: 15,
    },
    {
      fullName: "Жанар Алиева",
      email: "zh.alieva@yandex.kz",
      phone: "+7 710 111 2233",
      iin: "111111123456",
      appliedAt: daysAgo(21),
      total: 42,
      l: 40,
      p: 44,
      s: 41,
      per: 43,
      anti: 58,
    },
    {
      fullName: "Рустем Беков",
      email: "r.bekov@gmail.com",
      phone: "+7 711 222 3344",
      iin: "121212234567",
      appliedAt: daysAgo(28),
      total: 95,
      l: 94,
      p: 96,
      s: 93,
      per: 95,
      anti: 8,
    },
    {
      fullName: "Айдана Серикова",
      email: "a.serik@mail.ru",
      phone: "+7 712 333 4455",
      iin: "131313345678",
      appliedAt: daysAgo(35),
      total: 58,
      l: 55,
      p: 60,
      s: 57,
      per: 59,
      anti: 33,
    },
    {
      fullName: "Олжас Нуртазин",
      email: "o.nurtazin@inbox.kz",
      phone: "+7 713 444 5566",
      iin: "141414456789",
      appliedAt: daysAgo(42),
      total: 33,
      l: 30,
      p: 35,
      s: 32,
      per: 36,
      anti: 70,
    },
    {
      fullName: "Ляззат Ермекова",
      email: "l.yermekova@gmail.com",
      phone: "+7 714 555 6677",
      iin: "151515567890",
      appliedAt: daysAgo(60),
      total: 81,
      l: 82,
      p: 78,
      s: 84,
      per: 79,
      anti: 20,
    },
  ];

  const seedEssay =
    "Мотивационное эссе для поступления в inVision U по направлению Software Engineering. " +
    "Моя цель — усилить лидерские качества в рамках учебного проекта и в будущей команде. " +
    "Я привожу пример опыта: в команде мы реализовали проект, где важны были коммуникация и team-дух. " +
    "Отношение к лидерству, цели и ответственному опыту формирует мой профессиональный профиль. " +
    "Командная работа и личная дисциплина для меня основа доверия в software и в команде.";

  for (const s of specs) {
    await prisma.user.create({
      data: {
        email: s.email.toLowerCase(),
        passwordHash: applicantSeedPw,
        role: UserRole.APPLICANT,
        fullName: s.fullName,
        phone: s.phone,
        iin: s.iin,
        candidate: {
          create: {
            applicationStatus: ApplicationStatus.PENDING,
            appliedAt: s.appliedAt,
            essay: seedEssay,
            resumeFileName: "resume.pdf",
            evaluation: {
              create: {
                totalScore: s.total,
                leadershipScore: s.l,
                professionalScore: s.p,
                socialScore: s.s,
                personalScore: s.per,
                analysis:
                  "Сильные стороны: коммуникация и структурность текста. Рекомендуется углубить практический опыт.",
                antiCheatScore: s.anti,
              },
            },
          },
        },
      },
    });
  }

  await prisma.user.createMany({
    data: [
      {
        email: "g.akhmetova@mail.kz",
        passwordHash: applicantSeedPw,
        role: UserRole.APPLICANT,
        fullName: "Гульнара Ахметова",
        phone: "+7 715 666 7788",
        iin: "161616678901",
      },
      {
        email: "b.moldabek@gmail.com",
        passwordHash: applicantSeedPw,
        role: UserRole.APPLICANT,
        fullName: "Бекзат Молдабеков",
        phone: "+7 716 777 8899",
        iin: "171717789012",
      },
    ],
  });

  console.log(
    "Seed OK: 1 admin +",
    specs.length + 2,
    "applicants (15 with applications, 2 without)"
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
