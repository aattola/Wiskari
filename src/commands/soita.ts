import {
  Client,
  CommandInteraction,
  GuildMember,
  InteractionReplyOptions,
} from 'discord.js';
import { player } from '../music/player';
import { SlashCommand } from '../types/command';
import { CustomError, NotInCallError } from '../music/errors';
import { Sentry } from '../logging/sentry';

const Soita: SlashCommand = {
  data: {
    name: 'soita',
    description: 'Soita mussaa tällä tästä',
    options: [
      { name: 'musa', description: 'dev', type: 'STRING', required: true },
    ],
  },
  async execute(interaction: CommandInteraction, client: Client) {
    if (!(interaction.member as GuildMember).voice.channelId)
      return NotInCallError(interaction);

    if (
      interaction.guild.me.voice.channelId &&
      (interaction.member as GuildMember).voice.channelId !==
        interaction.guild.me.voice.channelId
    )
      return CustomError(interaction, 'Et ole mun kanaval. Yritä nyt edes.');

    await interaction.deferReply();
    const query = interaction.options.get('musa').value;
    const queue = player.createQueue(interaction.guild, {
      metadata: {
        channel: interaction.channel,
      },
    });

    // verify vc connection
    try {
      if (!queue.connection)
        await queue.connect((interaction.member as GuildMember).voice.channel);
    } catch (err) {
      queue.destroy();
      Sentry.captureException(err, {
        user: interaction.user,
        tags: {
          bug: 'interaction',
          command: 'soita',
        },
        extra: {
          interaction,
        },
      });
      return CustomError(
        interaction,
        'En pystynyt yhdistämään kanavalle syystä X Y Z'
      );
      return;
    }

    Sentry.addBreadcrumb({
      category: 'channelConnection',
      message: `Uusi voiceConnection jonka kanavan id: ${queue.connection.channel.id}`,
      level: Sentry.Severity.Info,
      data: queue.connection,
    });

    // await interaction.defer();
    const track = await player
      .search(<string>query, {
        requestedBy: interaction.member.user.id,
      })
      .then((x) => x.tracks[1]);
    if (!track) {
      await interaction.followUp({
        content: `❌ | DEV Mussaa ${query} ei löytynyt`,
      });
      return;
    }

    queue.play(track);
    queue.setVolume(100 / 2);

    await interaction.followUp({
      content: `⏱️ | DEV ladataan: ${track.title}`,
    });

    // await interaction.reply('soita testi vammainen !');
  },
};

export default Soita;
