const {
  Client,
  GatewayIntentBits,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Ping
  if (message.content === '!ping') {
    return message.reply('🏓 Pong !');
  }

  // Embed
  if (message.content === '+embed') {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📢 Mon premier Embed')
      .setDescription('Ceci est un embed envoyé par le bot.')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: '👤 Auteur',
          value: message.author.tag,
          inline: true
        },
        {
          name: '🌍 Serveur',
          value: message.guild.name,
          inline: true
        }
      )
      .setTimestamp()
      .setFooter({ text: 'Bot Discord' });

    return message.channel.send({ embeds: [embed] });
  }

  // Réactions
  if (message.content === '+react') {
    const msg = await message.channel.send('Réagissez !');
    await msg.react('👍');
    await msg.react('❤️');
    await msg.react('🔥');
    return;
  }

  // Dire un message
  if (message.content.startsWith('+say ')) {
    const texte = message.content.slice(5);
    return message.channel.send(texte);
  }
});

// Connexion du bot
client.login(process.env.TOKEN);