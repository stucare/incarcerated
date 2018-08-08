const logger = require('./../logger/logger');
const { ObjectID } = require('mongodb');
let { mongoose } = require('./../db/mongoose');
let { User } = require('./../../models/user');
let { Room } = require('./../../models/room');
let { Maintenance } = require('./../../models/maintenance');

let seedDb = () => {

    let seedUser = {
        username: 'admin',
        password: 'nRn)0op{',
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
        isSuperuser: true
    }

    let seedRoom = [{
        code: "adod",
        display: {
            name: "A Dose of Death",
            description: "<p>A large number of the local community have fallen ill, the latest person to start feeling unwell is a very close friend of yours. You have been trying to get the bottom of things as you have a strong suspicion that a well regarded local doctor is behind the outbreak.</p><p>After overhearing a strange conversation while out at a restaurant between two local MP’s your theory seems even more feasible. But how will you prove that this well respected local figure has sinister intentions?</p><p>You and a friend have snuck into the rogue doctor’s office to investigate, but have been accidently locked in by the cleaner. This gives you the opportunity to search for evidence to prove your theory. Time is ticking, the cleaner will be back in 60 minutes to check the building before locking up, can you find what you need and escape the office before you get caught? Remember, don’t get found out or you could end up being the next victim of this diabolical doctor’s evil plan.</p>"
        }
    }, {
        code: "age",
        display: {
            name: "Conspiracy - Agenda 21",
            description: "<p>After seeing a story online about a YouTube Conspiracy Theorist who has concerns about a UN research facility, you have been following the story and his updates. One night you see a live feed on his Facebook account which leads you to believe he has been captured.  Ever since the live feed there has been no updates to any of his accounts. Was it all a hoax? Is there something more sinister going on?</p><p>Roll on 6 months, you and your friends no longer speak of the YouTuber and life goes on as normal. One morning you all receive individual letters from the Supreme Court asking you to report for “Jury Service” at The Old Bailey. The letter states you must not tell anyone that you have been called in, the case you have been assigned to is extremely serious and the person on trial is a huge threat to national security. The letter also states that all Jury candidates are required to attend by law and any leak of information will lead to prosecution.</p><p>Further instructions ask you to arrive at the ‘UN Research Facility Northwood’ as secure transport will be provided to ensure all Jury members are kept safe on the way to the trial.</p><p><strong>This Game may not be suitable for those with epilepsy.<br>This game may not be suitable for players under the age of 16.</strong></p>",
            minPlayers: 3,
            maxPlayers: 7
        }
    }, {
        code: "cr",
        display: {
            name: "Cops &amp; Robbers",
            description: "<p>Cops and Robbers is a brand new, head to head, escape room experience!</p><p>Facing the Cops is a grueling investigation where they need to discover the King Pin’s identity and ultimately gain access to the King Pin’s safe house. Meanwhile the Robbers are facing stealthy clear out of the safe house. However the only safe exit is now the emergency door, which no one knows how to unlock. The Robbers kn<p>Will the Cops gain access to the Safe House and catch the criminals?<br>Will the Robbers manage to clear the safe house of all the incriminating items?</p><p>	All we know is the King Pin is on his way back to release his associates so the pressure is on the Cops to solve the crimes that are still under investigation.</p>",
            minPlayers: 4,
            maxPlayers: 12
        }
    }, {
        code: "pow",
        display: {
            name: "Prisoner of War",
            description: "<p>It’s August 8th 1971, you and your squadron are deep in the Vietnamese jungle and are under heavy fire from the advancing Viet Cong troops. Your team spread out to try and find better cover as your camp is now overrun by the communist opposition. Several of your comrades have been killed in action but you and a small number of troops have managed to retreat to a safe distance.</p><p>You have been made aware that during your retreat attempt your leading commander has been captured on the battlefield and is being held in a cell deep behind enemy lines. You and your squadron have made the treacherous hike back into the jungle to find your commander as you would never leave a good man behind.</p><p>After discovering the location of his jungle cell, you and your team tunnel into the guard’s office where you discover your commander is still alive but locked in a small cell. All of a sudden, the tunnel you dug to enter the room collapses so not only is your commander still trapped in the cell but you find yourselves in the locked guard’s room with no way out. Can you find a way to get your commander out of the cell and escape the guard’s office before they return?  You have 60 minutes…</p>",
            isAccessible: true
        }
    }]

    let seedMaintenance = {
        active: true
    }

    User.findOne({ username: seedUser.username }).then((user) => {
        if (!user) {
            new User(seedUser).save();
            console.log('Seeded User')
        }
    }).catch((err) => {
        console.log(err);
    });

    Room.findOne({ code: seedRoom[0].code }).then((room) => {
        if (!room) {
            seedRoom.forEach(element => {
                new Room(element).save();
                console.log('Seeded Room')
            });
        }
    }).catch((err) => {
        console.log(err);
    });

    Maintenance.findOne({}).then((maintenance) => {
        if (!maintenance) {
            new Maintenance(seedMaintenance).save()
            console.log('Seeded Maintenance')
        }
    }).catch((err) => {
        console.log(err);
    });

}

module.exports = { seedDb }
