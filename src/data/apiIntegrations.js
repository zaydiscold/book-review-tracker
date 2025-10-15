// Placeholder: wire up Goodreads / StoryGraph integrations after OAuth flow is defined.
export async function postReviewToGoodreads(review) {
  console.info("Skipping Goodreads sync until credentials are configured", review);
  return { status: "pending", provider: "goodreads" };
}

export async function postReviewToStorygraph(review) {
  console.info("Skipping StoryGraph sync until credentials are configured", review);
  return { status: "pending", provider: "storygraph" };
}
