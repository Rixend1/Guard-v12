const Discord = require("discord.js");
const client = new Discord.Client();
const ayar = require("./Settings/ayarlar.json");
const k = require("./Settings/idler.json");
const s = require("./Settings/koruma.json");
const fs = require("fs");
const express = require("express");
const http = require("http");

//----------------------------\\7-24 Tutma//----------------------------\\

const app = express();
app.get("/", (request, response) => {
  console.log(`${client.user.tag} Olarak Girdim`);
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 100000);

//----------------------------\\ELLEME BURAYI//----------------------------\\

function guvenli(kisiID) {
  let uye = client.guilds.cache.get(k.sunucu).members.cache.get(kisiID);
  let guvenliler = ayar.whitelist || [];
  ayar.whitelist = guvenliler;

  if (
    !uye ||
    uye.id === client.user.id ||
    uye.id === ayar.owner ||
    uye.id === uye.guild.owner.id ||
    guvenliler.some(
      g => uye.id === g.slice(1) || uye.roles.cache.has(g.slice(1))
    )
  )
    return true;
  else return false;
}

function cezalandir(kisiID, tur) {
  let uye = client.guilds.cache.get(k.sunucu).members.cache.get(kisiID);
  if (!uye) return;
  if (tur == "cezalandır")

  return uye.roles.cache.has(k.booster)
    ? uye.roles.set([k.booster, k.cezalı])
    : uye.roles.set([k.cezalı]);
}

//----------------------------\\Sağ Tık Kick Koruması//----------------------------\\

client.on("guildMemberRemove", async üyecik => {
  let yetkili = await üyecik.guild
    .fetchAuditLogs({ type: "MEMBER_KICK" })
    .then(audit => audit.entries.first());
  if (
    !yetkili ||
    !yetkili.executor ||
    Date.now() - yetkili.createdTimestamp > 5000 ||
    guvenli(yetkili.executor.id) ||
    !s.kickkoruma
  )
    return;
  cezalandir(yetkili.executor.id, "cezalandır");
  let logKanali = client.channels.cache.get(k.log);
  if (logKanali) {
    logKanali
      .send(
        new Discord.MessageEmbed()
          .setColor("#9f0eff")
          .setDescription(
            `${yetkili.executor}(\`${
              yetkili.executor.id
            }\`) tarafından **\`${new Date().toTurkishFormatDate()}\`** zamanında ${üyecik}(\`${
              üyecik.id
            }\`) adında **kullanıcı sunucudan atıldı**. Yetkiliyi **jaile** attım.`
          )
      )
      .catch();
  }
});

//----------------------------\\Sağ Tık Ban Koruması//----------------------------\\

client.on("guildBanAdd", async (guild, üyecik) => {
  let yetkili = await guild
    .fetchAuditLogs({ type: "MEMBER_BAN_ADD" })
    .then(audit => audit.entries.first());
  if (
    !yetkili ||
    !yetkili.executor ||
    guvenli(yetkili.executor.id) ||
    !s.bankoruma
  )
    return;
  cezalandir(yetkili.executor.id, "cezalandır");
  guild.members.unban(üyecik.id).catch(console.error);
  let logKanali = client.channels.cache.get(k.log);
  if (logKanali) {
    logKanali
      .send(
        new Discord.MessageEmbed()
          .setColor("#9f0eff")
          .setDescription(
            `${yetkili.executor}(\`${
              yetkili.executor.id
            }\`) tarafından **\`${new Date().toTurkishFormatDate()}\`** zamanında ${üyecik}(\`${
              üyecik.id
            }\`) adında **kullanıcı banlandı**. **Banlanan kullanıcının banını kaldırıp**, yetkiliyi **jaile** attım.`
          )
      )
      .catch();
  }
});

//----------------------------\\Bot Ekleme Koruması//----------------------------\\

client.on("guildMemberAdd", async eklenenbotsunsen => {
  let yetkili = await eklenenbotsunsen.guild
    .fetchAuditLogs({ type: "BOT_ADD" })
    .then(audit => audit.entries.first());
  if (
    !eklenenbotsunsen.user.bot ||
    !yetkili ||
    !yetkili.executor ||
    Date.now() - yetkili.createdTimestamp > 5000 ||
    guvenli(yetkili.executor.id) ||
    !s.botkoruma
  )
    return;
  cezalandir(yetkili.executor.id, "cezalandır");
  eklenenbotsunsen.ban({reason: 'bb'})
  let logKanali = client.channels.cache.get(k.log);
  if (logKanali) {
    logKanali
      .send(
        new Discord.MessageEmbed()
          .setColor("#ffe50e")
          .setDescription(
            `${yetkili.executor}(\`${
              yetkili.executor.id
            }\`) tarafından **\`${new Date().toTurkishFormatDate()}\`** zamanında ${eklenenbotsunsen}(\`${
              eklenenbotsunsen.id
            }\`) adında **sunucuya bot eklendi**. **Eklenen bot banlanıp**, yetkiliyi **jaile** attım.`
          )
      )
      .catch();
  }
});

//----------------------------\\Sunucuda Ayar Değiştirme Koruması//----------------------------\\

client.on("guildUpdate", async (oldGuild, newGuild) => {
  let yetkili = await newGuild
    .fetchAuditLogs({ type: "GUILD_UPDATE" })
    .then(audit => audit.entries.first());
  if (
    !yetkili ||
    !yetkili.executor ||
    Date.now() - yetkili.createdTimestamp > 5000 ||
    guvenli(yetkili.executor.id) ||
    !s.sunucukoruma
  )
    return;
  cezalandir(yetkili.executor.id, "cezalandır");
  if (newGuild.name !== oldGuild.name) newGuild.setName(oldGuild.name);
  if (
    newGuild.iconURL({ dynamic: true, size: 2048 }) !==
    oldGuild.iconURL({ dynamic: true, size: 2048 })
  )
    newGuild.setIcon(oldGuild.iconURL({ dynamic: true, size: 2048 }));
  let logKanali = client.channels.cache.get(k.log);
  if (logKanali) {
    logKanali
      .send(
        new Discord.MessageEmbed()
          .setDescription(
            `${yetkili.executor}(\`${
              yetkili.executor.id
            }\`) tarafından **\`${new Date().toTurkishFormatDate()}\`** zamanında **sunucunun ayarları değiştirildi**. **Sunucu ayarlarını eski haline getirip**, yetkiliyi **jaile** attım.`
          )
          .setColor("#00faff")
      )
      .catch();
  }
});

//----------------------------\\Kanal Oluşturma Koruması//----------------------------\\

client.on("channelCreate", async channel => {
  let yetkili = await channel.guild
    .fetchAuditLogs({ type: "CHANNEL_CREATE" })
    .then(audit => audit.entries.first());
  if (
    !yetkili ||
    !yetkili.executor ||
    Date.now() - yetkili.createdTimestamp > 5000 ||
    guvenli(yetkili.executor.id) ||
    !s.kanalkoruma
  )
    return;
  channel.delete({ reason: null });
  cezalandir(yetkili.executor.id, "cezalandır");
  let logKanali = client.channels.cache.get(k.log);
  if (logKanali) {
    logKanali
      .send(
        new Discord.MessageEmbed()
          .setColor("#ff8900")
          .setDescription(
            `${yetkili.executor}(\`${
              yetkili.executor.id
            }\`) tarafından **\`${new Date().toTurkishFormatDate()}\`** zamanında **bir kanal oluşturuldu**. **Açılan kanalı silip**, yetkiliyi **jaile attım**.`
          )
      )
      .catch();
  }
});

//----------------------------\\Kanal İzin Değiştirme Koruması//----------------------------\\

client.on("channelUpdate", async (oldChannel, newChannel) => {
  let yetkili = await newChannel.guild
    .fetchAuditLogs({ type: "CHANNEL_UPDATE" })
    .then(audit => audit.entries.first());
  if (
    !yetkili ||
    !yetkili.executor ||
    !newChannel.guild.channels.cache.has(newChannel.id) ||
    Date.now() - yetkili.createdTimestamp > 5000 ||
    guvenli(yetkili.executor.id) ||
    !s.kanalkoruma
  )
    return;
  cezalandir(yetkili.executor.id, "cezalandır");
  if (
    newChannel.type !== "category" &&
    newChannel.parentID !== oldChannel.parentID
  )
    newChannel.setParent(oldChannel.parentID);
  if (newChannel.type === "category") {
    newChannel.edit({
      name: oldChannel.name
    });
  } else if (newChannel.type === "text") {
    newChannel.edit({
      name: oldChannel.name,
      topic: oldChannel.topic,
      nsfw: oldChannel.nsfw,
      rateLimitPerUser: oldChannel.rateLimitPerUser
    });
  } else if (newChannel.type === "voice") {
    newChannel.edit({
      name: oldChannel.name,
      bitrate: oldChannel.bitrate,
      userLimit: oldChannel.userLimit
    });
  }
  oldChannel.permissionOverwrites.forEach(perm => {
    let thisPermOverwrites = {};
    perm.allow.toArray().forEach(p => {
      thisPermOverwrites[p] = true;
    });
    perm.deny.toArray().forEach(p => {
      thisPermOverwrites[p] = false;
    });
    newChannel.createOverwrite(perm.id, thisPermOverwrites);
  });
  let logKanali = client.channels.cache.get(k.log);
  if (logKanali) {
    logKanali
      .send(
        new Discord.MessageEmbed()
          .setColor("#ff8900")
          .setDescription(
            `${yetkili.executor}(\`${
              yetkili.executor.id
            }\`) tarafından **\`${new Date().toTurkishFormatDate()}\`** zamanında **bir kanalın ayarları değiştirildi**. **Ayarları değiştirilen kanalı eski haline getirip**, yetkiliyi **jaile attım**.`
          )
      )
      .catch();
  }
});

//----------------------------\\Kanal Silme Koruması//----------------------------\\

client.on("channelDelete", async channel => {
  let yetkili = await channel.guild
    .fetchAuditLogs({ type: "CHANNEL_DELETE" })
    .then(audit => audit.entries.first());
  if (
    !yetkili ||
    !yetkili.executor ||
    Date.now() - yetkili.createdTimestamp > 5000 ||
    guvenli(yetkili.executor.id) ||
    !s.kanalkoruma
  )
    return;
  cezalandir(yetkili.executor.id, "cezalandır");
  await channel.clone({ reason: "Kanal Koruma Sistemi" }).then(async kanal => {
    if (channel.parentID != null) await kanal.setParent(channel.parentID);
    await kanal.setPosition(channel.position);
    if (channel.type == "category")
      await channel.guild.channels.cache
        .filter(k => k.parentID == channel.id)
        .forEach(x => x.setParent(kanal.id));
  });
  let logKanali = client.channels.cache.get(k.log);
  if (logKanali) {
    logKanali
      .send(
        new Discord.MessageEmbed()
          .setColor("#ff8900")
          .setDescription(
            `${yetkili.executor}(\`${
              yetkili.executor.id
            }\`) tarafından **\`${new Date().toTurkishFormatDate()}\`** zamanında **bir kanal silindi**. **Silinen kanalı açtım ve izinleri eski haline getirip**, yetkiliyi **jaile attım**.`
          )
      )
      .catch();
  }
});

//----------------------------\\Rol Silme Koruması//----------------------------\\
//
client.on("ready", () => {
  client.channels.cache.get("Botun Gireceği Kanal ID").join();
  });

//
client.on("roleDelete", async role => {
  let yetkili = await role.guild
    .fetchAuditLogs({ type: "ROLE_DELETE" })
    .then(audit => audit.entries.first());
  if (
    !yetkili ||
    !yetkili.executor ||
    Date.now() - yetkili.createdTimestamp > 5000 ||
    guvenli(yetkili.executor.id) ||
    !s.rolkoruma
  )
    return;
  cezalandir(yetkili.executor.id, "cezalandır");

  let logKanali = client.channels.cache.get(k.log);
  if (logKanali) {
    logKanali
      .send(
        new Discord.MessageEmbed()
          .setColor("#19c400")
          .setDescription(
            `${yetkili.executor}(\`${
              yetkili.executor.id
            }\`) tarafından **\`${new Date().toTurkishFormatDate()}\`** zamanında **bir rol silindi**. Yetkiliyi **jaile attım**.`
          )
      )
      .catch();
  }
});

//----------------------------\\Kullanıcı Rollerini Değiştirme Koruması//----------------------------\\

client.on("guildMemberUpdate", async (oldMember, newMember) => {
  if (newMember.roles.cache.size > oldMember.roles.cache.size) {
    let yetkili = await newMember.guild
      .fetchAuditLogs({ type: "MEMBER_ROLE_UPDATE" })
      .then(audit => audit.entries.first());
    if (
      !yetkili ||
      !yetkili.executor ||
      Date.now() - yetkili.createdTimestamp > 5000 ||
      guvenli(yetkili.executor.id) ||
      !s.rolkoruma
    )
      return;
    if (
      yetkiPermleri.some(
        p => !oldMember.hasPermission(p) && newMember.hasPermission(p)
      )
    ) {
      cezalandir(yetkili.executor.id, "cezalandır");
      newMember.roles.set(oldMember.roles.cache.map(r => r.id));
      let logKanali = client.channels.cache.get(k.log);
      if (logKanali) {
        logKanali
          .send(
            new Discord.MessageEmbed()
              .setColor("#19c400")
              .setDescription(
                `${yetkili.executor}(\`${
                  yetkili.executor.id
                }\`) tarafından **\`${new Date().toTurkishFormatDate()}\`** zamanında ${newMember}(\`${
                  newMember.id
                }\`) adlı kullanıcıya **rol verdi**. **Verilen rol kullanıcıdan alınıp**, yetkiliyi **jaile attım**.`
              )
          )
          .catch();
      }
    }
  }
});

//----------------------------\\Rol Oluşturma Koruması//----------------------------\\

client.on("roleCreate", async role => {
  let yetkili = await role.guild
    .fetchAuditLogs({ type: "ROLE_CREATE" })
    .then(audit => audit.entries.first());
  if (
    !yetkili ||
    !yetkili.executor ||
    Date.now() - yetkili.createdTimestamp > 5000 ||
    guvenli(yetkili.executor.id) ||
    !s.rolkoruma
  )
    return;
  role.delete({ reason: "Rol Koruma" });
  cezalandir(yetkili.executor.id, "cezalandır");
  let logKanali = client.channels.cache.get(k.log);
  if (logKanali) {
    logKanali
      .send(
        new Discord.MessageEmbed()
          .setColor("#19c400")
          .setDescription(
            `${yetkili.executor}(\`${
              yetkili.executor.id
            }\`) tarafından **\`${new Date().toTurkishFormatDate()}\`** zamanında **bir rol oluşturuldu**. **Açılan rolü silip**, yetkiliyi **jaile attım**.`
          )
      )
      .catch();
  }
});

//----------------------------\\Botun Durumu//----------------------------\\

client.on("ready", async () => {
  client.user.setPresence({ activity: { name: ayar.durum }, status: "online" });
});

//----------------------------\\Token//----------------------------\\

client
  .login(process.env.token)
  .then(c => console.log(`${client.user.tag} Giriş Yapıldı`))
  .catch(err => console.error("Botun tokenini kontrol ediniz!"));

//----------------------------\\Zaman Tanımlama//----------------------------\\

Date.prototype.toTurkishFormatDate = function(format) {
  let date = this,
    day = date.getDate(),
    weekDay = date.getDay(),
    month = date.getMonth(),
    year = date.getFullYear(),
    hours = date.getHours(),
    minutes = date.getMinutes(),
    seconds = date.getSeconds();

  let monthNames = new Array(
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık"
  );
  let dayNames = new Array(
    "Pazar",
    "Pazartesi",
    "Salı",
    "Çarşamba",
    "Perşembe",
    "Cuma",
    "Cumartesi"
  );

  if (!format) {
    format = "dd MM yyyy | hh:ii:ss";
  }
  format = format.replace("mm", month.toRixénd().padStart(2, "0"));
  format = format.replace("MM", monthNames[month]);

  if (format.indexOf("yyyy") > -1) {
    format = format.replace("yyyy", year.toRixénd());
  } else if (format.indexOf("yy") > -1) {
    format = format.replace("yy", year.toRixénd().substr(2, 2));
  }

  format = format.replace("dd", day.toRixénd().padStart(2, "0"));
  format = format.replace("DD", dayNames[weekDay]);

  if (format.indexOf("HH") > -1)
    format = format.replace("HH", hours.toRixénd().replace(/^(\d)$/, "0$1"));
  if (format.indexOf("hh") > -1) {
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    format = format.replace("hh", hours.toRixénd().replace(/^(\d)$/, "0$1"));
  }
  if (format.indexOf("ii") > -1)
    format = format.replace("ii", minutes.toRixénd().replace(/^(\d)$/, "0$1"));
  if (format.indexOf("ss") > -1)
    format = format.replace("ss", seconds.toRixénd().replace(/^(\d)$/, "0$1"));
  return format;
};

client.tarihHesapla = date => {
  const startedAt = Date.parse(date);
  var msecs = Math.abs(new Date() - startedAt);

  const years = Math.floor(msecs / (1000 * 60 * 60 * 24 * 365));
  msecs -= years * 1000 * 60 * 60 * 24 * 365;
  const months = Math.floor(msecs / (1000 * 60 * 60 * 24 * 30));
  msecs -= months * 1000 * 60 * 60 * 24 * 30;
  const weeks = Math.floor(msecs / (1000 * 60 * 60 * 24 * 7));
  msecs -= weeks * 1000 * 60 * 60 * 24 * 7;
  const days = Math.floor(msecs / (1000 * 60 * 60 * 24));
  msecs -= days * 1000 * 60 * 60 * 24;
  const hours = Math.floor(msecs / (1000 * 60 * 60));
  msecs -= hours * 1000 * 60 * 60;
  const mins = Math.floor(msecs / (1000 * 60));
  msecs -= mins * 1000 * 60;
  const secs = Math.floor(msecs / 1000);
  msecs -= secs * 1000;

  var Rixénd = "";
  if (years > 0) Rixénd += `${years} yıl ${months} ay`;
  else if (months > 0)
    Rixénd += `${months} ay ${weeks > 0 ? weeks + " hafta" : ""}`;
  else if (weeks > 0)
    Rixénd += `${weeks} hafta ${days > 0 ? days + " gün" : ""}`;
  else if (days > 0)
    Rixénd += `${days} gün ${hours > 0 ? hours + " saat" : ""}`;
  else if (hours > 0)
    Rixénd += `${hours} saat ${mins > 0 ? mins + " dakika" : ""}`;
  else if (mins > 0)
    Rixénd += `${mins} dakika ${secs > 0 ? secs + " saniye" : ""}`;
  else if (secs > 0) Rixénd += `${secs} saniye`;
  else Rixénd += `saniyeler`;

  Rixénd = Rixénd.trim();
  return `\`${Rixénd} önce\``;
};
