"use client";

import { X, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: string; // "contact" par défaut, mais pourrait être étendu pour d'autres actions
}

export default function LoginRequiredModal({
  isOpen,
  onClose,
  action = "contact",
}: LoginRequiredModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <>
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {/* Modal */}
        <div className="relative bg-white border-2 border-black max-w-md w-full rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center text-white">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-black">
                  Connexion requise
                </h3>
                <p className="text-sm text-gray-600">
                  Accédez à toutes les fonctionnalités
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-black font-black text-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Message principal */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <UserPlus className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-bold text-black">
                Vous devez être connecté pour contacter un développeur
              </h4>
              <p className="text-gray-600">
                Créez un compte gratuitement ou connectez-vous pour accéder à
                toutes les fonctionnalités de LinkerAI
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link href="/auth/signup" className="block">
                <button
                  className="w-full bg-black text-white py-3 px-6 rounded-lg font-black hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  onClick={onClose}
                >
                  <UserPlus className="w-5 h-5" />
                  Créer un compte gratuit
                </button>
              </Link>

              <Link href="/auth/login" className="block">
                <button
                  className="w-full border-2 border-black text-black py-3 px-6 rounded-lg font-black hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  onClick={onClose}
                >
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </button>
              </Link>
            </div>

            {/* Avantages */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h5 className="text-sm font-bold text-black mb-2">
                Avec un compte LinkerAI :
              </h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                  Contactez directement les développeurs
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                  Gérez vos projets et candidatures
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                  Accédez à la messagerie intégrée
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                  Créez votre profil professionnel
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

