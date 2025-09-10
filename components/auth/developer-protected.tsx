"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface DeveloperProtectedProps {
  children: React.ReactNode;
}

export default function DeveloperProtected({
  children,
}: DeveloperProtectedProps) {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (authLoading) return;

      if (!user) {
        router.push("/auth/login");
        return;
      }

      try {
        // Vérifier le type d'utilisateur
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("id", user.id)
          .single();

        setUserProfile(profile);

        if (profile?.user_type === "developer") {
          setAuthorized(true);
        } else {
          // Rediriger les clients vers leur dashboard
          router.push("/dashboard/client");
          return;
        }
      } catch (error) {
        console.error("Erreur vérification profil:", error);
        router.push("/auth/login");
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [user, authLoading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">
          Vérification des autorisations...
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-purple-500/20 border border-purple-500/50 text-purple-400 px-6 py-4 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
          <p>Cette section est réservée aux développeurs.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
