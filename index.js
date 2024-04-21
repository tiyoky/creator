const Discord = require('discord.js');
const puppeteer = require('puppeteer');
const { generate } = require('generate-password'); // Vous pouvez utiliser cette bibliothèque pour la génération de mots de passe

const client = new Discord.Client();
const prefix = '+';

client.once('ready', () => {
    console.log('Bot is ready');
    client.user.setActivity('Megumi', { type: 'WATCHING' });
});

client.on('message', async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'generate') {
        if (!args.length) {
            return message.channel.send("Veuillez fournir une invitation de serveur valide après la commande.");
        }

        const password = generatePassword();
        const email = generateEmail();
        const serverInvite = args[0];

        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.goto('https://discord.com/login');

            await page.type('input[name="email"]', email);
            await page.type('input[name="password"]', password);
            await Promise.all([
                page.waitForNavigation(),
                page.click('button[type="submit"]')
            ]);
            await page.waitForTimeout(5000);

            const guild = await client.guilds.fetch(serverInvite);
            if (!guild) throw new Error('L\'invitation de serveur est invalide.');

            await guild.addMember(message.author, { accessToken: email });
            message.channel.send(`Vous avez rejoint le serveur ${guild.name} avec succès.`);
            await browser.close();
            message.channel.send(`Email: ${email}\nMot de passe: ${password}`);
        } catch (error) {
            console.error("Une erreur s'est produite:", error);
            message.channel.send("Une erreur est survenue lors de la tentative de rejoindre le serveur.");
            await browser.close(); // Assurez-vous de fermer le navigateur en cas d'erreur
        }
    }
});

function generatePassword() {
    return generate({ length: 12, numbers: true }); // Génère un mot de passe aléatoire avec 12 caractères et chiffres
}

function generateEmail() {
    return 'utilisateur' + Math.floor(Math.random() * 1000) + '@example.com';
}

client.login(process.env.TOKEN); // Utiliser une variable d'environnement pour le jeton
