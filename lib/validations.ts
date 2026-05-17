import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  phone: z.string().optional(),
  location: z.string().optional(),
  education: z.array(
    z.object({
      id: z.string().optional(),
      institution: z.string().min(1, "Institution is required"),
      degree: z.string().min(1, "Degree is required"),
      startDate: z.string().min(1, "Start date is required"),
      endDate: z.string(),
    })
  ).optional(),
  experience: z.array(
    z.object({
      id: z.string().optional(),
      company: z.string().min(1, "Company is required"),
      role: z.string().min(1, "Role is required"),
      description: z.string(),
      startDate: z.string().min(1, "Start date is required"),
      endDate: z.string(),
    })
  ).optional(),
  skills: z.array(
    z.object({
      id: z.string().optional(),
      name: z.string().min(1, "Skill name is required"),
    })
  ).optional(),
  projects: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1, "Project title is required"),
      description: z.string(),
      techStack: z.string(),
    })
  ).optional(),
});

export const resumeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type ResumeInput = z.infer<typeof resumeSchema>;
