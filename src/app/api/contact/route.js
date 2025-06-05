import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // Supabase client-fabrik
import { Resend } from "resend"; // Resend til e-mail-udsendelse
import { EmailTemplate } from "@/components/Form/EmailTemplate"; // React-baseret e-mail-skabelon

// Initialisér Resend med API-nøgle fra miljøvariabel
const resend = new Resend(process.env.RESEND_API_KEY);

// API-handler til POST-anmodninger (kontaktformular)
export async function POST(request) {
  // Parse JSON-body fra request
  const body = await request.json();
  const { firstName, lastName, email, subject, message } = body;

  // Tjek at alle nødvendige felter er til stede
  if (!firstName || !lastName || !email || !subject || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Gem beskeden i Supabase-databasen
  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert([
    {
      first_name: firstName,
      last_name: lastName,
      email,
      subject,
      message,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send en bekræftelsesmail via Resend med React-baseret template
  try {
    const { data, error: emailError } = await resend.emails.send({
      from: "Ari <onboarding@resend.dev>", // Afsenderadresse (skal være verificeret)
      to: email, // Modtagerens e-mail
      subject: "Thank you for contacting us!", // Emne på bekræftelsesmail
      react: EmailTemplate({ firstName, subject, message }), // React-baseret skabelon
    });
    if (emailError) {
      console.error("Resend error:", emailError);
    } else {
      console.log("Resend email response:", data);
    }
  } catch (emailError) {
    console.error("Email send error:", emailError);
  }
  // Returnér succes hvis alt gik godt
  return NextResponse.json({ success: true });
}
