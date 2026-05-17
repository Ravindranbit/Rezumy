"use client";

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { User, ProfileData, ResumeData, GitHubRepoData } from "@/types";
import { apiFetch } from "@/utils/api";

// ============================================================
// Auth Context & Hook
// ============================================================

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const { data } = await apiFetch<User>("/api/auth/me", { cache: "no-store" });
    setUser(data || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const logout = async () => {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// ============================================================
// Profile Hook
// ============================================================

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data, error } = await apiFetch<ProfileData>("/api/profile");
    if (error) {
      setError(error);
    } else {
      setProfile(data || null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProfile = async (profileData: Partial<ProfileData>) => {
    setSaving(true);
    setError(null);
    const { data, error } = await apiFetch<ProfileData>("/api/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    if (error) {
      setError(error);
    } else {
      setProfile(data || null);
    }
    setSaving(false);
    return { data, error };
  };

  const clearError = useCallback(() => setError(null), []);

  return { profile, loading, saving, error, fetchProfile, saveProfile, clearError };
}

// ============================================================
// Resume Hook
// ============================================================

export function useResume() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchResume = useCallback(async () => {
    setLoading(true);
    const { data, error } = await apiFetch<ResumeData>("/api/resume");
    if (error) {
      setError(error);
    } else {
      setResume(data || null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  const saveResume = useCallback(async (resumeData: Partial<ResumeData>) => {
    setSaving(true);
    setError(null);
    const method = resume?.id ? "PUT" : "POST";
    const body = resume?.id
      ? { ...resumeData, id: resume.id }
      : resumeData;

    const { data, error } = await apiFetch<ResumeData>("/api/resume", {
      method,
      body: JSON.stringify(body),
    });
    if (error) {
      setError(error);
    } else {
      setResume(data || null);
    }
    setSaving(false);
    return { data, error };
  }, [resume?.id]);

  const clearError = useCallback(() => setError(null), []);

  return { resume, loading, saving, error, fetchResume, saveResume, clearError };
}

// ============================================================
// GitHub Hook
// ============================================================

export function useGitHub() {
  const [repos, setRepos] = useState<GitHubRepoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = useCallback(async (refresh = false) => {
    setLoading(true);
    setError(null);
    const url = refresh ? "/api/github/repos?refresh=true" : "/api/github/repos";
    const { data, error } = await apiFetch<GitHubRepoData[]>(url);
    if (error) {
      setError(error);
    } else {
      setRepos(data || []);
    }
    setLoading(false);
  }, []);

  const refreshRepos = useCallback(async () => {
    setSyncing(true);
    await fetchRepos(true);
    setSyncing(false);
  }, [fetchRepos]);

  const importSelected = useCallback(async () => {
    if (importing) return { error: "Already importing" };
    setImporting(true);
    setError(null);
    const { data, error } = await apiFetch<{ imported: number }>(
      "/api/github/import",
      { method: "POST" }
    );
    setImporting(false);
    if (error) {
      setError(error);
      return { error };
    }
    return { data };
  }, [importing]);

  const toggleSelect = useCallback(async (id: string, isSelected: boolean) => {
    if (importing) return;

    setRepos((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isSelected } : r))
    );

    const { error: selectError } = await apiFetch("/api/github/select", {
      method: "PUT",
      body: JSON.stringify({ id, isSelected }),
    });

    if (selectError) {
      setRepos((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isSelected: !isSelected } : r))
      );
      return;
    }

    await importSelected();
  }, [importing, importSelected]);

  const disconnect = useCallback(async () => {
    const { error } = await apiFetch("/api/github/disconnect", {
      method: "POST",
    });
    if (!error) {
      setRepos([]);
    }
    return { error };
  }, []);

  const batchToggle = useCallback(async (isSelected: boolean) => {
    if (importing) return;

    setRepos((prev) => prev.map((r) => ({ ...r, isSelected })));

    const { error: batchError } = await apiFetch("/api/github/batch-select", {
      method: "PUT",
      body: JSON.stringify({ isSelected }),
    });

    if (batchError) {
      await fetchRepos();
      return;
    }

    await importSelected();
  }, [importing, fetchRepos, importSelected]);

  const unlinkRepo = useCallback(async (repoName: string) => {
    const { error } = await apiFetch("/api/github/unlink", {
      method: "DELETE",
      body: JSON.stringify({ repoName }),
    });
    if (!error) {
      setRepos((prev) =>
        prev.map((r) =>
          r.name === repoName ? { ...r, isSelected: false } : r
        )
      );
    }
    return { error };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const analyzeRepo = useCallback(async (id: string) => {
    const { data, error } = await apiFetch<{
      id: string;
      skills: string[];
      projectType: string;
      techStack: string;
      description: string;
    }>("/api/github/analyze", {
      method: "POST",
      body: JSON.stringify({ repoId: id }),
    });
    if (data && !error) {
      setRepos((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                analyzedSkills: data.skills,
                projectType: data.projectType,
                techStack: data.techStack,
                description: data.description,
              }
            : r
        )
      );
    }
    return { data, error };
  }, []);

  const analyzeAll = useCallback(async () => {
    const { data, error } = await apiFetch<{
      analyzed: number;
      total: number;
      errors: string[];
    }>("/api/github/analyze?all=false");
    if (!error) await fetchRepos();
    return { data, error };
  }, [fetchRepos]);

  return {
    repos,
    loading,
    syncing,
    importing,
    error,
    fetchRepos,
    refreshRepos,
    toggleSelect,
    batchToggle,
    importSelected,
    disconnect,
    unlinkRepo,
    clearError,
    analyzeRepo,
    analyzeAll,
  };
}

// ============================================================
// Jobs Hook
// ============================================================

import { JobListing } from "@/types";

export function useJobs() {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchJobs = useCallback(async (jobRole: string, location?: string) => {
    setSearching(true);
    setError(null);
    const { data, error: fetchError } = await apiFetch<JobListing[]>("/api/jobs/search", {
      method: "POST",
      body: JSON.stringify({ jobRole, location }),
    });

    if (fetchError) {
      console.error("Job search failed:", fetchError);
      setError(fetchError);
    } else {
      setJobs(data || []);
    }
    setSearching(false);
    return { data, error: fetchError };
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { jobs, searching, error, searchJobs, clearError };
}
