"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { User, Mail, Shield, Calendar, ArrowLeft, CheckCircle2, Camera } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getUserProfile, updateUserProfileImage, uploadProfileImage } from "@/app/actions/profile";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, status: sessionStatus, update } = useSession();
  const [profileData, setProfileData] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadProfile = async () => {
    try {
      setLoadingProfile(true);
      const data = await getUserProfile();
      setProfileData(data);
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      toast.error("Erro ao carregar os dados do perfil.");
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      loadProfile();
    }
  }, [sessionStatus]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("A imagem deve ter menos de 3 MB.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadProfileImage(formData);
      if (res?.success && res.url) {
        await updateUserProfileImage(res.url);
        await loadProfile();
        // Atualiza a sessão do NextAuth para propagar o novo avatar no header
        await update();
        toast.success("Foto de perfil atualizada com sucesso!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Falha ao atualizar foto de perfil.");
    } finally {
      setUploading(false);
    }
  };

  if (sessionStatus === "loading" || (sessionStatus === "authenticated" && loadingProfile)) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100" />
      </div>
    );
  }

  if (sessionStatus === "unauthenticated" || !profileData) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-zinc-500">Por favor, faça login para ver seu perfil.</p>
        <Link href="/login">
          <Button>Ir para o Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Meu Perfil</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Gerencie e visualize suas informações de conta.</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Card: Avatar & Status */}
        <div className="md:col-span-1 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 flex flex-col items-center text-center justify-between">
          <div className="space-y-4 w-full flex flex-col items-center">
            <div className="relative group rounded-full overflow-hidden h-24 w-24 border-2 border-zinc-200 dark:border-zinc-800">
              {profileData.image ? (
                <img
                  src={profileData.image}
                  alt={profileData.name || "Foto de perfil"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-bold text-3xl text-zinc-700 dark:text-zinc-300">
                  {profileData.name?.[0]?.toUpperCase() || profileData.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}

              {profileData.hasPassword && (
                <>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-center p-1"
                  >
                    <Camera className="h-5 w-5 mb-1" />
                    Alterar Foto
                  </label>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={handleAvatarChange}
                  />
                </>
              )}

              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                </div>
              )}
            </div>

            <div className="space-y-1 w-full px-2">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 break-words whitespace-normal max-w-full">{profileData.name || "Usuário"}</h3>
              <p className="text-xs text-zinc-500 break-all whitespace-normal max-w-full">{profileData.email}</p>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
              <Shield className="h-3 w-3" />
              Plano Ativo
            </span>
          </div>

          <div className="w-full pt-6 border-t border-zinc-100 dark:border-zinc-900 mt-6">
            <Link href="/dashboard/billing">
              <Button className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200">
                Ver Planos
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Card: Details Form */}
        <div className="md:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 space-y-6">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-900 pb-3">Detalhes da Conta</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <User className="h-3 w-3" />
                Nome Completo
              </label>
              <input
                type="text"
                readOnly
                value={profileData.name || "Não informado"}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Mail className="h-3 w-3" />
                E-mail
              </label>
              <input
                type="email"
                readOnly
                value={profileData.email || ""}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Membro Desde
              </label>
              <input
                type="text"
                readOnly
                value={new Date(profileData.createdAt).toLocaleDateString("pt-BR", { year: "numeric", month: "long" })}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-200 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Shield className="h-3 w-3" />
                Status do Perfil
              </label>
              <div className="flex items-center gap-1.5 h-9 px-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">Verificado</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {profileData.hasPassword 
                ? "Perfil local. Clique sobre a imagem para carregar uma foto personalizada." 
                : "Perfil sincronizado via provedor OAuth de autenticação social."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
