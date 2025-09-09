"use client";

import { useState } from "react";
import { X, Send, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { useLanguage } from "@/contexts/LanguageContext";

const supabase = createClient();

interface Project {
  id: string;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  client_id: string;
}

interface ProjectApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  user: any;
  onSuccess?: () => void;
}

export default function ProjectApplicationModal({
  isOpen,
  onClose,
  project,
  user,
  onSuccess,
}: ProjectApplicationModalProps) {
  const { t } = useLanguage();
  const [applicationData, setApplicationData] = useState({
    message: "",
  });
  const [applicationLoading, setApplicationLoading] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  const formatBudget = (min: number, max: number) => {
    if (min && max) {
      return `${min}€ - ${max}€`;
    } else if (min) {
      return `À partir de ${min}€`;
    } else if (max) {
      return `Jusqu'à ${max}€`;
    }
    return "Budget à discuter";
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project || !user || !applicationData.message.trim()) {
      return;
    }

    setApplicationLoading(true);

    try {
      console.log("🚀 DÉMARRAGE CANDIDATURE:", {
        userId: user.id,
        projectId: project.id,
        clientId: project.client_id,
      });

      // 1. Vérifier candidature existante
      const { data: existingApplications } = await supabase
        .from("project_applications")
        .select("id, status")
        .eq("project_id", project.id)
        .eq("developer_id", user.id);

      if (existingApplications && existingApplications.length > 0) {
        console.log("⚠️ Candidature déjà existante");
        alert("Vous avez déjà candidaté à ce projet.");
        return;
      }

      // 2. Créer la candidature
      const { data: applicationResult, error: applicationError } =
        await supabase
          .from("project_applications")
          .insert({
            project_id: project.id,
            developer_id: user.id,
            message: applicationData.message.trim(),
            status: "pending",
          })
          .select();

      if (applicationError) {
        console.error("❌ Erreur candidature:", applicationError);
        throw new Error(`Erreur candidature: ${applicationError.message}`);
      }

      console.log("✅ Candidature créée:", applicationResult);

      // 3. Créer ou récupérer conversation
      let conversationId: string;

      // D'abord essayer de récupérer une conversation existante
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("client_id", project.client_id)
        .eq("developer_id", user.id)
        .eq("project_id", project.id)
        .single();

      if (existingConv) {
        // Conversation existe, on l'utilise
        conversationId = existingConv.id;
        console.log("📞 Conversation existante utilisée:", conversationId);

        // Mettre à jour timestamp
        await supabase
          .from("conversations")
          .update({
            updated_at: new Date().toISOString(),
            last_message_at: new Date().toISOString(),
          })
          .eq("id", conversationId);
      } else {
        // Créer nouvelle conversation
        const { data: newConversation, error: convError } = await supabase
          .from("conversations")
          .insert({
            client_id: project.client_id,
            developer_id: user.id,
            project_id: project.id,
            subject: `Candidature pour "${project.title}"`,
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (convError) {
          console.error("❌ Erreur conversation:", convError);
          throw new Error(`Erreur conversation: ${convError.message}`);
        }

        conversationId = newConversation.id;
        console.log("✅ Nouvelle conversation créée:", conversationId);
      }

      // 4. Créer message de candidature
      const { data: newMessage, error: msgError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: `🎉 Vous avez reçu une nouvelle candidature !\n\n${applicationData.message.trim()}\n\nNous vous souhaitons une excellente collaboration et la réussite de votre projet. L'équipe LinkerAI reste disponible pour vous accompagner tout au long de cette aventure.\n\nBonne chance ! 🚀`,
          is_read: false,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (msgError) {
        console.error("❌ Erreur message:", msgError);
        throw new Error(`Erreur message: ${msgError.message}`);
      }

      console.log("✅ Message créé:", newMessage);
      console.log("🎉 CANDIDATURE COMPLÈTE RÉUSSIE !");

      // Afficher le succès
      setApplicationSuccess(true);

      // Callback optionnel pour rafraîchir la page parent
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("💥 Erreur globale:", error);
      alert("Une erreur est survenue lors de l'envoi de votre candidature");
    } finally {
      setApplicationLoading(false);
    }
  };

  const closeModal = () => {
    setApplicationData({ message: "" });
    setApplicationSuccess(false);
    setApplicationLoading(false);
    onClose();
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl">
        <div className="p-4 sm:p-6 border-b-2 border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl sm:text-2xl font-black">
              Candidater au projet
            </h2>
            <p className="text-gray-600 mt-1 text-sm sm:text-base truncate">
              {project.title}
            </p>
          </div>
          <button
            onClick={closeModal}
            className="p-2 hover:bg-gray-100 rounded flex-shrink-0"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {applicationSuccess ? (
          <div className="p-6 sm:p-8 text-center">
            <CheckCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl sm:text-2xl font-black text-black mb-2">
              Candidature envoyée !
            </h3>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              Votre candidature a été envoyée au client. Vous recevrez une
              réponse dans votre messagerie.
            </p>
            <button
              onClick={closeModal}
              className="bg-black text-white px-4 sm:px-6 py-2 sm:py-3 font-black rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
            >
              Fermer
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            {/* Info du projet */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-bold text-black mb-2">{project.title}</h4>
              <p className="text-gray-600 text-sm">
                {formatBudget(project.budget_min, project.budget_max)}
              </p>
            </div>

            <form
              onSubmit={handleSubmitApplication}
              className="space-y-4 sm:space-y-6"
            >
              <div>
                <label className="block text-sm font-black text-black mb-2">
                  Message de candidature *
                </label>
                <textarea
                  required
                  rows={6}
                  value={applicationData.message}
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-lg focus:border-black focus:outline-none font-bold resize-none text-sm sm:text-base"
                  placeholder="Présentez-vous et expliquez pourquoi vous êtes le candidat idéal pour ce projet..."
                />
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  💡 Vous pourrez envoyer votre CV directement dans la
                  conversation après votre candidature.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-200 text-black font-black rounded-lg hover:border-black transition-colors text-sm sm:text-base"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={
                    applicationLoading || !applicationData.message.trim()
                  }
                  className="bg-black text-white px-4 sm:px-6 py-2 sm:py-3 font-black rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {applicationLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Envoyer la candidature
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
