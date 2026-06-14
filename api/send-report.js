// api/send-report.js
// Vercel Serverless Function — Duurzaam op Wielen | Bedrijfswagen Calculator
//
// Zet de volgende Environment Variables in Vercel:
//   BREVO_API_KEY      → jouw Brevo API sleutel
//   MAKE_WEBHOOK_URL   → jouw Make.com webhook URL
//   NOTIFY_EMAIL       → jouw e-mailadres voor leadmeldingen (bijv. info@duurzaamopwielen.nl)

export default async function handler(req, res) {
  // Alleen POST toestaan
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    naam,
    bedrijf,
    beroep,
    tel,
    email,
    pakket,
    zonnepanelen,
    voertuigen,
    dieselprijs,
    werkdagen,
    generatorkosten,
    investering,
    eia,
    besparing5jaar,
    terugverdientijd,
    timestamp,
  } = req.body;

  // Validatie
  if (!naam || !bedrijf || !email) {
    return res.status(400).json({ error: "Verplichte velden ontbreken" });
  }

  try {
    // ─────────────────────────────────────────────
    // 1. E-MAIL NAAR KLANT via Brevo
    // ─────────────────────────────────────────────
    const klantEmail = {
      sender: { name: "Duurzaam op Wielen", email: process.env.NOTIFY_EMAIL },
      to: [{ email, name: naam }],
      subject: `Uw off-grid rapport — ${pakket}`,
      htmlContent: `
        <!DOCTYPE html>
        <html lang="nl">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Uw rapport — Duurzaam op Wielen</title>
        </head>
        <body style="margin:0;padding:0;background:#F0EDE4;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EDE4;padding:32px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

                  <!-- HEADER -->
                  <tr>
                    <td style="background:#2D5A3D;padding:32px 40px;border-bottom:3px solid #C17A3A;text-align:center;">
                      <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:#C17A3A;">BEDRIJFSWAGEN CALCULATOR</p>
                      <h1 style="margin:12px 0 4px;font-size:28px;font-weight:800;color:#F0EDE4;letter-spacing:-0.02em;">Uw persoonlijk rapport</h1>
                      <p style="margin:0;font-size:14px;color:rgba(240,237,228,0.65);">Energie zonder grenzen</p>
                    </td>
                  </tr>

                  <!-- INTRO -->
                  <tr>
                    <td style="background:#ffffff;padding:32px 40px;">
                      <p style="margin:0 0 16px;font-size:16px;color:#2D5A3D;font-weight:600;">Goedemiddag ${naam},</p>
                      <p style="margin:0 0 16px;font-size:14px;color:#444;line-height:1.7;">
                        Bedankt voor het invullen van de calculator. Hieronder vindt u uw persoonlijk rapport op basis van uw gegevens voor <strong>${bedrijf}</strong>.
                        Wij nemen binnen 24 uur contact op voor een gratis adviesgesprek — geheel vrijblijvend.
                      </p>
                    </td>
                  </tr>

                  <!-- UW SITUATIE -->
                  <tr>
                    <td style="background:#ffffff;padding:0 40px 24px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0EDE4;border-radius:4px;overflow:hidden;">
                        <tr>
                          <td style="padding:14px 20px;border-bottom:1px solid rgba(45,90,61,0.1);">
                            <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#607858;">UW SITUATIE</p>
                          </td>
                        </tr>
                        ${[
                          ["Beroep", beroep],
                          ["Aantal voertuigen", voertuigen + (voertuigen == 1 ? " voertuig" : " voertuigen")],
                          ["Dieselprijs", "€" + parseFloat(dieselprijs).toFixed(2) + " per liter"],
                          ["Werkdagen per jaar", werkdagen + " dagen"],
                          ["Zonnepanelen op dak", zonnepanelen ? "Ja" : "Nee / onbekend"],
                          ["Aanbevolen pakket", pakket],
                        ].map(([label, waarde]) => `
                        <tr>
                          <td style="padding:10px 20px;border-bottom:1px solid rgba(45,90,61,0.06);">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="font-size:12px;color:#607858;">${label}</td>
                                <td align="right" style="font-size:13px;font-weight:600;color:#2D5A3D;">${waarde}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>`).join("")}
                      </table>
                    </td>
                  </tr>

                  <!-- RESULTATEN -->
                  <tr>
                    <td style="background:#1e2820;padding:32px 40px;">
                      <p style="margin:0 0 20px;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#607858;">UW BEREKENING</p>
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="33%" style="padding:0 8px 0 0;vertical-align:top;">
                            <p style="margin:0 0 4px;font-size:10px;color:#607858;text-transform:uppercase;letter-spacing:0.1em;">Generator kost u</p>
                            <p style="margin:0;font-size:26px;font-weight:800;color:#e07070;line-height:1;">${generatorkosten}</p>
                            <p style="margin:4px 0 0;font-size:11px;color:#607858;">per jaar</p>
                          </td>
                          <td width="33%" style="padding:0 8px;vertical-align:top;border-left:1px solid rgba(255,255,255,0.05);">
                            <p style="margin:0 0 4px;font-size:10px;color:#607858;text-transform:uppercase;letter-spacing:0.1em;">Uw investering</p>
                            <p style="margin:0;font-size:26px;font-weight:800;color:#C17A3A;line-height:1;">${investering}</p>
                            <p style="margin:4px 0 0;font-size:11px;color:#C17A3A;">overheid betaalt ${eia} via EIA</p>
                          </td>
                          <td width="33%" style="padding:0 0 0 8px;vertical-align:top;border-left:1px solid rgba(255,255,255,0.05);">
                            <p style="margin:0 0 4px;font-size:10px;color:#607858;text-transform:uppercase;letter-spacing:0.1em;">Besparing 5 jaar</p>
                            <p style="margin:0;font-size:26px;font-weight:800;color:#F0EDE4;line-height:1;">${besparing5jaar}</p>
                            <p style="margin:4px 0 0;font-size:11px;color:#607858;">na aftrek investering</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- TERUGVERDIENTIJD -->
                  <tr>
                    <td style="background:#161d16;padding:20px 40px;border-top:1px solid rgba(255,255,255,0.04);">
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin:0 0 2px;font-size:11px;color:#607858;">Terugverdientijd (na EIA-aftrek)</p>
                            <p style="margin:0;font-size:20px;font-weight:800;color:#F0EDE4;">${terugverdientijd}</p>
                          </td>
                          <td align="right">
                            <p style="margin:0 0 2px;font-size:11px;color:#607858;">EIA fiscale aftrek 2026</p>
                            <p style="margin:0;font-size:20px;font-weight:800;color:#C17A3A;">${eia}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- EIA UITLEG -->
                  <tr>
                    <td style="background:#ffffff;padding:24px 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border-left:3px solid #C17A3A;padding:16px 20px;">
                        <tr>
                          <td>
                            <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#C17A3A;">EIA — Energie Investerings Aftrek 2026</p>
                            <p style="margin:0;font-size:13px;color:#444;line-height:1.7;">
                              Via de EIA-regeling mag u <strong>${eia}</strong> extra aftrekken van uw fiscale winst.
                              Dit verlaagt uw belastbaar inkomen aanzienlijk. Bespreek het exacte voordeel met uw boekhouder.
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- CTA -->
                  <tr>
                    <td style="background:#ffffff;padding:8px 40px 40px;text-align:center;">
                      <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.7;">
                        Wij nemen binnen <strong>24 uur</strong> contact op voor een gratis adviesgesprek op maat.<br>
                        Heeft u nu al vragen? Bel of mail ons gerust.
                      </p>
                      <a href="tel:+31" style="display:inline-block;background:#2D5A3D;color:#F0EDE4;padding:14px 32px;font-size:14px;font-weight:700;text-decoration:none;border-radius:3px;margin-bottom:12px;">
                        Plan een adviesgesprek
                      </a>
                      <p style="margin:16px 0 0;font-size:11px;color:#999;">
                        Duurzaam op Wielen — Off Grid Systems<br>
                        <a href="https://duurzaamopwielen.nl" style="color:#C17A3A;text-decoration:none;">duurzaamopwielen.nl</a>
                      </p>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="background:#F0EDE4;padding:20px 40px;text-align:center;border-top:3px solid #C17A3A;">
                      <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#2D5A3D;">ENERGIE ZONDER GRENZEN</p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    // ─────────────────────────────────────────────
    // 2. NOTIFICATIE NAAR JOUW E-MAILADRES
    // ─────────────────────────────────────────────
    const notificatieEmail = {
      sender: { name: "DOW Calculator", email: process.env.NOTIFY_EMAIL },
      to: [{ email: process.env.NOTIFY_EMAIL, name: "Duurzaam op Wielen" }],
      subject: `🔔 Nieuwe lead: ${naam} — ${bedrijf} (${pakket})`,
      htmlContent: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;">
          <h2 style="color:#2D5A3D;margin:0 0 20px;">Nieuwe bedrijfswagen lead</h2>
          <table cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
            ${[
              ["Naam", naam],
              ["Bedrijf", bedrijf],
              ["Beroep", beroep],
              ["Telefoon", tel],
              ["E-mail", email],
              ["Pakket", pakket],
              ["Voertuigen", voertuigen],
              ["Investering", investering],
              ["EIA voordeel", eia],
              ["Terugverdientijd", terugverdientijd],
              ["Besparing 5 jaar", besparing5jaar],
              ["Tijdstip", new Date(timestamp).toLocaleString("nl-NL")],
            ].map(([label, waarde]) => `
              <tr style="border-bottom:1px solid #eee;">
                <td style="padding:8px 12px 8px 0;font-size:12px;color:#607858;white-space:nowrap;">${label}</td>
                <td style="padding:8px 0;font-size:13px;color:#2D5A3D;font-weight:600;">${waarde}</td>
              </tr>`).join("")}
          </table>
          <p style="margin:20px 0 0;font-size:12px;color:#999;">Verstuurd via duurzaamopwielen.nl/bedrijfswagen-calculator</p>
        </div>
      `,
    };

    // Verstuur beide e-mails via Brevo
    const brevoUrl = "https://api.brevo.com/v3/smtp/email";
    const brevoHeaders = {
      "Content-Type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    };

    await Promise.all([
      fetch(brevoUrl, { method: "POST", headers: brevoHeaders, body: JSON.stringify(klantEmail) }),
      fetch(brevoUrl, { method: "POST", headers: brevoHeaders, body: JSON.stringify(notificatieEmail) }),
    ]);

    // ─────────────────────────────────────────────
    // 3. MAKE.COM WEBHOOK → NOTION CRM
    // ─────────────────────────────────────────────
    if (process.env.MAKE_WEBHOOK_URL) {
      await fetch(process.env.MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          naam,
          bedrijf,
          beroep,
          tel,
          email,
          pakket,
          zonnepanelen,
          voertuigen,
          dieselprijs,
          werkdagen,
          generatorkosten,
          investering,
          eia,
          besparing5jaar,
          terugverdientijd,
          timestamp,
          bron: "bedrijfswagen-calculator",
        }),
      });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("send-report error:", err);
    return res.status(500).json({ error: "Er is iets misgegaan. Probeer het opnieuw." });
  }
}
