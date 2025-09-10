"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface ClientProtectedProps {
  children: React.ReactNode;
}

export default function ClientProtected({ children }: ClientProtectedProps) {
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

        if (profile?.user_type === "client") {
          setAuthorized(true);
        } else {
          // Rediriger les développeurs vers leur dashboard
          router.push("/dashboard/developer");
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
        <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">Accès refusé</h2>
          <p>Cette section est réservée aux clients.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
