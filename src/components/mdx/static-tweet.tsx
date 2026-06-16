import { getTweet } from "react-tweet/api";
import { EmbeddedTweet, TweetNotFound, enrichTweet } from "react-tweet";

/**
 * Build-safe tweet embed.
 *
 * react-tweet's `enrichTweet` (called by EmbeddedTweet during render) assumes a
 * fully-formed `entities` object and iterates `entities.hashtags`, `.urls`, etc.
 * Some tweets come back from the syndication API with a degenerate `entities: {}`
 * (or none), which makes those `for…of undefined` loops throw — and because this
 * happens at prerender time, a single bad tweet fails the entire production build.
 *
 * We fetch the tweet ourselves, normalize the shape enrichTweet depends on, and
 * fall back to TweetNotFound on any failure so the build can never die on a tweet.
 */
export async function StaticTweet({ id }: { id: string }) {
  let tweet: Awaited<ReturnType<typeof getTweet>>;
  try {
    tweet = await getTweet(id);
  } catch {
    return <TweetNotFound />;
  }
  if (!tweet) return <TweetNotFound />;

  const safeTweet = {
    ...tweet,
    display_text_range:
      tweet.display_text_range ??
      ([0, Array.from(tweet.text ?? "").length] as [number, number]),
    entities: {
      ...tweet.entities,
      hashtags: tweet.entities?.hashtags ?? [],
      urls: tweet.entities?.urls ?? [],
      user_mentions: tweet.entities?.user_mentions ?? [],
      symbols: tweet.entities?.symbols ?? [],
    },
  } as NonNullable<typeof tweet>;

  // Guard against any remaining enrichment failure before committing to render.
  try {
    enrichTweet(safeTweet);
  } catch {
    return <TweetNotFound />;
  }

  return <EmbeddedTweet tweet={safeTweet} />;
}
