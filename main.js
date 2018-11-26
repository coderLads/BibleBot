const Discord = require('discord.js');
const axios = require('axios');
const bot = new Discord.Client();
const fs = require('fs');

var PastebinAPI = require('pastebin-js'),
    pastebin = new PastebinAPI('9af30c4d64e0cced323c6aa0db20309b');

var dict = JSON.parse(fs.readFileSync('storage/emojiMapping.json'));

const prefix = ".";

bot.on('ready', () => {  
    console.log("Bot ready!");
    bot.user.setActivity('.help');
})

bot.on('message', (message) => {
    
    let msg = message.content.toLowerCase();
    let prefixThing = msg.substring(0, 1);
    let args = message.content.slice(prefix.length).trim().split(' ');   
    let command = args.shift().toLowerCase();
    let msgAll = message.content.slice(prefix.length + command.length).trim();

    if(prefixThing != prefix)
        return;

    if(command ==  'verse') {
        message.delete(1000);
        axios.get('http://labs.bible.org/api/?passage=random&type=json').then(response => {

            let myObj = response.data;
            let messageToSend = '*' + myObj[0].text.trim() + "*\n***" + myObj[0].bookname + ' ' + myObj[0].chapter + ":" + myObj[0].verse + "***";

            message.channel.send(addEmoji(dict,messageToSend));
        });
    }

    if(command == 'emojify') {
        message.delete(1000);
        message.channel.send(addEmoji(dict, msgAll));
        
    }

    if(command == 'define') {
        message.delete(1000);

        let word = args[0].toLowerCase();
        let emoji = args[1];
 
        dict[word] = emoji;

        fs.writeFile('storage/emojiMapping.json', JSON.stringify(dict), (err) => {
            if(err) console.error(err);
        });

        message.channel.send("Added the key: ***" + word + "***, with value: " + emoji + "!").then(sentMessage => {
            sentMessage.delete(5000);
        });
    }

    if(command == 'emojijson') {
	message.delete(1000);
        pastebin
        .createPasteFromFile("storage/emojiMapping.json", "pastebin-js test", null, 1, "N")
        .then(function (data) {
            // we have succesfully pasted it. Data contains the id
            //console.log(data);
            message.author.send("Current emoji mappings uploaded to: " + data);
        })
        .fail(function (err) {
            console.log(err);
        });
    }

    if(command == 'help') {
        message.delete(1000);

        let messageToSend = "```\n";
        
        messageToSend += tab("emojify") + "type a string after to emojify it\n";
        messageToSend += tab("verse") + "random bible verse\n";
        messageToSend += tab("define [word] [emoji]") + "adds emoji to bible list of usable emojis\n";
        messageToSend += tab("help") + "this";

        messageToSend += '```';
        message.author.send(messageToSend);
    }

});


function tab(str) {
    if(str.length < 24) {
        for(var i = str.length; i <= 24; i++)
            str += " ";
    }
    else {
        for(var i = 1; i <= 8; i++)
            str += " ";
    }
    return str;
}

function addEmoji(dict, message) {
    let fullString = "";
    message.split(" ").forEach(word => {
        if (word.toLowerCase() in dict){
           fullString += word + " " + dict[word.toLowerCase()] + " ";
        } else {
            fullString += word + " ";
        }
    });
    return fullString;
}

bot.login("TOKEN HERE");
