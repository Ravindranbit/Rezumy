import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";
import { profileSchema } from "@/lib/validations";

// GET /api/profile — Fetch profile with all nested data
export async function GET() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        education: true,
        experience: true,
        skills: true,
        projects: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/profile — Update profile with nested relations
export async function PUT(request: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { phone, location, education, experience, skills, projects } =
      parsed.data;

    // Get existing profile
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Update profile in a transaction
    const updatedProfile = await prisma.$transaction(async (tx) => {
      // Update basic profile fields
      await tx.profile.update({
        where: { userId },
        data: {
          phone: phone || "",
          location: location || "",
        },
      });

      // Replace education entries
      if (education !== undefined) {
        await tx.education.deleteMany({
          where: { profileId: existingProfile.id },
        });
        if (education.length > 0) {
          await tx.education.createMany({
            data: education.map((e) => ({
              profileId: existingProfile.id,
              institution: e.institution,
              degree: e.degree,
              startDate: e.startDate,
              endDate: e.endDate,
            })),
          });
        }
      }

      // Replace experience entries
      if (experience !== undefined) {
        await tx.experience.deleteMany({
          where: { profileId: existingProfile.id },
        });
        if (experience.length > 0) {
          await tx.experience.createMany({
            data: experience.map((e) => ({
              profileId: existingProfile.id,
              company: e.company,
              role: e.role,
              description: e.description,
              startDate: e.startDate,
              endDate: e.endDate,
            })),
          });
        }
      }

      // Replace skills
      if (skills !== undefined) {
        await tx.skill.deleteMany({
          where: { profileId: existingProfile.id },
        });
        if (skills.length > 0) {
          await tx.skill.createMany({
            data: skills.map((s) => ({
              profileId: existingProfile.id,
              name: s.name,
            })),
          });
        }
      }

      // Replace projects
      if (projects !== undefined) {
        await tx.project.deleteMany({
          where: { profileId: existingProfile.id },
        });
        if (projects.length > 0) {
          await tx.project.createMany({
            data: projects.map((p) => ({
              profileId: existingProfile.id,
              title: p.title,
              description: p.description,
              techStack: p.techStack,
            })),
          });
        }
      }

      // Return the updated profile with all relations
      return tx.profile.findUnique({
        where: { userId },
        include: {
          education: true,
          experience: true,
          skills: true,
          projects: true,
        },
      });
    });

    return NextResponse.json({ success: true, data: updatedProfile });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
