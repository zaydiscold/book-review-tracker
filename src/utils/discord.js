import { getCoverUrl } from "./covers";

const REACTION_GUIDE = [
  { emoji: "1️⃣", label: "Loved it" },
  { emoji: "2️⃣", label: "Pretty good" },
  { emoji: "3️⃣", label: "Take it or leave it" },
  { emoji: "4️⃣", label: "Not for me" },
  { emoji: "🆕", label: "Interested" }
];

const EMBED_COLOR = 0xff7a2a;

// Send a styled embed with reaction guidance so Discord feels like a polished review feed.
export async function postReviewToDiscord({
  webhookUrl,
  book,
  review,
  recentReviews = [],
  shareMode = "full"
}) {
  if (!webhookUrl) {
    return { status: "skipped", reason: "missingWebhook" };
  }

  try {
    const title = book?.title ?? "Untitled";
    const author = book?.author ? ` by ${book.author}` : "";
    const ratingValue =
      typeof review?.rating === "number"
        ? review.rating.toFixed(review.rating % 1 === 0 ? 0 : 1)
        : null;
    const rating = ratingValue ? `${ratingValue}/10` : "Rating pending";
    const body = review?.text?.trim() ? review.text.trim() : "(No review text provided)";
    const coverUrl = book?.cover ? getCoverUrl(book.cover, "M") : null;

    const reactionLegend = REACTION_GUIDE.map((item) => `${item.emoji} 0 votes · ${item.label}`).join("\n");
    const reactionLine = REACTION_GUIDE.map((item) => `${item.emoji} ${item.label}`).join(" • ");

    const components = [];
    if (book?.openLibraryUrl) {
      components.push({
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: "Open Library",
            url: book.openLibraryUrl
          }
        ]
      });
    }

    const payload = buildPayload({
      title,
      author,
      rating,
      body,
      coverUrl,
      status: book?.status,
      reactionLegend,
      reactionLine,
      recentReviews,
      shareMode,
      components
    });

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Discord responded with status ${response.status}`);
    }

    return { status: "sent" };
  } catch (error) {
    console.error("Failed to post review to Discord", error);
    return { status: "error", error };
  }
}

function buildPayload({
  title,
  author,
  rating,
  body,
  coverUrl,
  status,
  reactionLegend,
  reactionLine,
  recentReviews,
  shareMode,
  components
}) {
  const summaryContent = `${reactionLine}\nReact with the matching number to rate **${title}${author}**.`;

  if (shareMode === "summary") {
    return {
      content: "",
      embeds: [
        {
          title: `${title}${author}`,
          color: EMBED_COLOR,
          description: formatSummaryDescription({ rating, reactionLine }),
          thumbnail: coverUrl ? { url: coverUrl } : undefined,
          footer: {
            text: "made with love by zayd / cold"
          },
          timestamp: new Date().toISOString()
        }
      ],
      components: components.length > 0 ? components : undefined
    };
  }

  const embed = {
    title: `${title}${author}`,
    description: body,
    color: EMBED_COLOR,
    fields: [
      { name: "Rating", value: `**${rating}**`, inline: true },
      { name: "Status", value: status ? formatStatus(status) : "—", inline: true },
      { name: "Reactions", value: reactionLegend, inline: false }
    ],
    footer: {
      text: "made with love by zayd / cold"
    },
    timestamp: new Date().toISOString()
  };

  const trimmedRecent = Array.isArray(recentReviews) ? recentReviews.slice(-3) : [];
  if (trimmedRecent.length > 0) {
    const summary = trimmedRecent
      .map((item) => {
        const ratingText =
          typeof item?.rating === "number"
            ? `${item.rating.toFixed(item.rating % 1 === 0 ? 0 : 1)}/10`
            : "—";
        const snippet = item?.text ? item.text.trim().slice(0, 120) : "(no text)";
        return `• ${ratingText} — ${snippet}${snippet.length === 120 ? "…" : ""}`;
      })
      .join("\n");

    embed.fields.push({ name: "Recent Takes", value: summary, inline: false });
  }

  if (coverUrl) {
    embed.thumbnail = { url: coverUrl };
  }

  return {
    content: "",
    embeds: [embed],
    components: components.length > 0 ? components : undefined
  };
}

function formatFiveRating(ratingTenText) {
  if (!ratingTenText || ratingTenText === "Rating pending") {
    return "Rating pending";
  }

  const numeric = Number.parseFloat((ratingTenText.match(/\d+(?:\.\d+)?/) ?? ["0"])[0]);
  if (Number.isNaN(numeric)) {
    return `${ratingTenText}`;
  }

  const fiveScale = numeric / 2;
  return `${fiveScale.toFixed(fiveScale % 1 === 0 ? 0 : 1)}/5`;
}

function formatSummaryDescription({ rating, reactionLine }) {
  const fiveScale = formatFiveRating(rating);
  return `⭐ ${fiveScale}\n${reactionLine}`;
}

function formatStatus(rawStatus) {
  if (!rawStatus) {
    return "—";
  }

  const mapping = {
    wishlist: "Wishlist",
    library: "Library",
    reading: "Reading",
    finished: "Finished",
    "re-reading": "Re-reading",
    "on-hold": "On Hold",
    "did-not-finish": "Did Not Finish"
  };

  return mapping[rawStatus] ?? rawStatus;
}
