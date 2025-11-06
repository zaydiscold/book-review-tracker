import {
  EmbedBuilder,
  SlashCommandBuilder,
} from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('pushbook')
  .setDescription('Post a book announcement and open a review thread.')
  .addStringOption((option) =>
    option
      .setName('title')
      .setDescription('Title of the book to share.')
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('author')
      .setDescription('Author name to display.')
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('cover')
      .setDescription('Image URL for the book cover.')
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('blurb')
      .setDescription('Optional summary or prompt to include in the message.')
      .setRequired(false),
  );

function trimThreadName(title) {
  const suffix = ' reviews';
  const maxLength = 90;
  const desiredLength = maxLength - suffix.length;
  const base = title.length > desiredLength ? `${title.slice(0, desiredLength - 1)}…` : title;
  return `${base}${suffix}`;
}

export async function execute(interaction) {
  const title = interaction.options.getString('title', true);
  const author = interaction.options.getString('author', true);
  const cover = interaction.options.getString('cover', true);
  const blurb = interaction.options.getString('blurb', false);

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setAuthor({ name: author })
    .setImage(cover)
    .setColor(0x5865f2)
    .setFooter({ text: 'Shared via Book Review Tracker' })
    .setTimestamp(new Date());

  if (blurb) {
    embed.setDescription(blurb);
  }

  try {
    const message = await interaction.reply({
      embeds: [embed],
      fetchReply: true,
    });

    if (!message.channel?.isTextBased() || message.channel.isThread()) {
      await interaction.followUp({
        content:
          'Posted the book but could not create a thread in this channel. Please ensure threads are allowed.',
        ephemeral: true,
      });
      return;
    }

    const threadName = trimThreadName(title);
    const thread = await message.startThread({
      name: threadName,
      autoArchiveDuration: 1440,
      reason: 'Book Review Tracker discussion thread',
    });

    await thread.send(
      `Kick off your reviews for **${title}** by ${author}! Drop takes, ratings, and follow-ups in this thread.`,
    );
  } catch (error) {
    console.error('Failed to post book announcement:', error);
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({
        content: 'Something went wrong while sharing that book. Please try again.',
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: 'Something went wrong while sharing that book. Please try again.',
        ephemeral: true,
      });
    }
  }
}
