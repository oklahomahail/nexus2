import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";

import { useClient } from "@/context/ClientContext";
import { supabase } from "@/lib/supabaseClient";

import { BrandForm } from "./BrandForm";
import { BrandPreviewPanel } from "./BrandPreviewPanel";
import { BrandProfile } from "./brandProfile.types";
import { BrandProfileLayout } from "./BrandProfileLayout";
import { BrandProfileSkeleton } from "./BrandProfileSkeleton";

export default function BrandProfilePage() {
  const { clientId } = useParams<{ clientId: string }>();
  const { currentClient } = useClient();
  const [profile, setProfile] = useState<BrandProfile>({
    name: "",
    mission: "",
    guidelinesUrl: "",
  });
  const [brandProfileId, setBrandProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch brand profile from Supabase when clientId changes
  useEffect(() => {
    async function fetchBrandProfile() {
      if (!clientId) {
        setError("No client selected");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("brand_profiles")
          .select("*")
          .eq("client_id", clientId)
          .is("deleted_at", null)
          .single();

        if (fetchError) {
          // If no brand profile exists yet, that's okay - we'll use empty state
          if (fetchError.code === "PGRST116") {
            setBrandProfileId(null);
            setProfile({
              name: currentClient?.name || "",
              mission: "",
              guidelinesUrl: "",
            });
          } else {
            throw fetchError;
          }
        } else if (data) {
          setBrandProfileId(data.id);
          setProfile({
            name: data.name || "",
            mission: data.mission_statement || "",
            guidelinesUrl: data.guidelines_url || "",
          });
        }
      } catch (err) {
        console.error("Error fetching brand profile:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load brand profile",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void fetchBrandProfile();
  }, [clientId, currentClient?.name]);

  // Save brand profile to Supabase
  const handleSave = useCallback(async () => {
    if (!clientId) return;

    try {
      setIsSaving(true);
      setSaveSuccess(false);
      setError(null);

      const profileData = {
        client_id: clientId,
        name: profile.name,
        mission_statement: profile.mission,
        guidelines_url: profile.guidelinesUrl || null,
      };

      if (brandProfileId) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from("brand_profiles")
          .update(profileData)
          .eq("id", brandProfileId);

        if (updateError) throw updateError;
      } else {
        // Create new profile
        const { data, error: insertError } = await supabase
          .from("brand_profiles")
          .insert(profileData)
          .select()
          .single();

        if (insertError) throw insertError;
        if (data) setBrandProfileId(data.id);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving brand profile:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save brand profile",
      );
    } finally {
      setIsSaving(false);
    }
  }, [clientId, profile, brandProfileId]);

  if (isLoading) {
    return <BrandProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <BrandProfileLayout
      left={
        <BrandForm
          profile={profile}
          setProfile={setProfile}
          onSave={handleSave}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
        />
      }
      right={<BrandPreviewPanel profile={profile} />}
    />
  );
}
