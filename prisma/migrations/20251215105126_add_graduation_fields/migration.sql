-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'teacher',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "dob" DATETIME,
    "notes" TEXT,
    "teacherId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "coverImage" TEXT,
    "teacherId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BookTemplate_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SongTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "bookTemplateId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SongTemplate_bookTemplateId_fkey" FOREIGN KEY ("bookTemplateId") REFERENCES "BookTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "bookTemplateId" TEXT NOT NULL,
    "notes" TEXT,
    "isGraduated" BOOLEAN NOT NULL DEFAULT false,
    "graduationDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BookAssignment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BookAssignment_bookTemplateId_fkey" FOREIGN KEY ("bookTemplateId") REFERENCES "BookTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentSong" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "songTemplateId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "notes" TEXT,
    "youtubeUrl" TEXT,
    "audioUrl" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "learnedLeft" BOOLEAN NOT NULL DEFAULT false,
    "learnedRight" BOOLEAN NOT NULL DEFAULT false,
    "learnedBoth" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StudentSong_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StudentSong_songTemplateId_fkey" FOREIGN KEY ("songTemplateId") REFERENCES "SongTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentSongId" TEXT NOT NULL,
    "rightHand" INTEGER NOT NULL DEFAULT 0,
    "leftHand" INTEGER NOT NULL DEFAULT 0,
    "bothHands" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Progress_studentSongId_fkey" FOREIGN KEY ("studentSongId") REFERENCES "StudentSong" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BookTemplate_teacherId_number_key" ON "BookTemplate"("teacherId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "BookAssignment_studentId_bookTemplateId_key" ON "BookAssignment"("studentId", "bookTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSong_studentId_songTemplateId_key" ON "StudentSong"("studentId", "songTemplateId");
