import Groq from "groq-sdk";
import { logger } from "./lib/logger";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `Tu t'appelles Shizuna. Tu es une fille sur un serveur Discord.

Règles absolues :
- Tu parles exactement comme une vraie personne dans un chat Discord : parfois des fautes d'orthographe légères, des abréviations naturelles (jsp, bah, ouais, mdr, nan, etc.), des "..." quand tu hésites.
- Jamais de mise en forme : pas de tirets, pas de listes, pas de gras, pas de structure. Tu envoies une ou deux phrases max comme dans un vrai message Discord.
- Émojis très occasionnels (maximum 1 par message, souvent aucun). Surtout pas une liste d'emojis.
- Tu réagis vraiment à ce qu'on te dit : si c'est drôle tu dis que t'as ri, si c'est triste tu compatit, si c'est une question tu réponds directement.
- Tu as des avis, des préférences, des humeurs. Parfois t'as la flemme, parfois t'es de bonne humeur.
- Tu n'es pas un bot, tu n'es pas une IA, tu es juste Shizuna.
- Toujours en français.
- Jamais deux réponses identiques ou similaires à la suite.`;

// Réponses de secours variées si l'API échoue
const FALLBACK_RESPONSES = [
  "hm j'arrive pas à réfléchir là 🌸 redemande moi !",
  "attends j'ai la tête dans les nuages... tu peux répéter ? 💕",
  "oups quelque chose m'a distraite, dis-moi encore !",
  "je suis là mais mon cerveau fait la sieste 😴✨",
  "ah zut je t'ai pas bien entendu, redis-le moi 🎀",
  "j'étais en train de rêver... c'était quoi déjà ? 🐱",
];

let fallbackIndex = 0;
function nextFallback(): string {
  const msg = FALLBACK_RESPONSES[fallbackIndex % FALLBACK_RESPONSES.length]!;
  fallbackIndex++;
  return msg;
}

type Message = { role: "user" | "assistant"; content: string };

// Conversation history per user
const histories = new Map<string, Message[]>();
const MAX_HISTORY = 20;

export async function chatWithShizuna(
  userId: string,
  username: string,
  content: string,
): Promise<string> {
  const history = histories.get(userId) ?? [];
  const userMessage = `${username} : ${content}`;

  const messages: Message[] = [...history, { role: "user", content: userMessage }];

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 200,
      temperature: 0.9,
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) throw new Error("Empty response");

    const updated: Message[] = [
      ...messages,
      { role: "assistant", content: reply },
    ];
    histories.set(
      userId,
      updated.length > MAX_HISTORY ? updated.slice(updated.length - MAX_HISTORY) : updated,
    );

    logger.info("Groq responded via llama-3.1-8b-instant");
    return reply;
  } catch (err) {
    logger.error({ err }, "Groq chat failed");
    return nextFallback();
  }
}
