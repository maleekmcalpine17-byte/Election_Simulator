// 2026 down-ballot race data, as of October 16, 2026.
// Sources: Wikipedia, "2026 United States Senate elections" and "2026 United States gubernatorial elections"
// (nominees, incumbents, seat holders); Cook Political Report ratings as listed there (Senate: Sep 23, 2026;
// Governor: Sep 10, 2026). Update this file as the race changes (withdrawals, replacements, new ratings).
//
// Each row: [state, party that holds the seat, Cook rating, Republican candidate, R is incumbent (1/0),
//            Democratic-side candidate, D-side is incumbent (1/0), D-side party ("D" or "I"), special election (1/0)]
// Where an independent is the main challenger to the Republican (Idaho, Montana, Nebraska, South Dakota) the
// independent fills the Democratic-side slot and is counted with the Democrats in the Senate tally.
// Two races list a placeholder because the nominee isn't a single person yet: Alaska governor (three Republicans
// advanced under ranked-choice voting) and Rhode Island governor (Republican primary result not in the source).
const RACES = {
  senate: {
    year: 2026,
    // seats NOT up for election: Democratic caucus (32 D + 2 independents) and Republicans
    notUp: { D: 34, R: 31 },
    races: [
    ["Alabama", "R", "Solid R", "Barry Moore", 0, "Everett Wess", 0, "D", 0],
    ["Alaska", "R", "Tossup", "Dan Sullivan", 1, "Mary Peltola", 0, "D", 0],
    ["Arkansas", "R", "Solid R", "Tom Cotton", 1, "Hallie Shoffner", 0, "D", 0],
    ["Colorado", "D", "Solid D", "Mark Baisley", 0, "John Hickenlooper", 1, "D", 0],
    ["Delaware", "D", "Solid D", "Michael Katz", 0, "Chris Coons", 1, "D", 0],
    ["Florida", "R", "Solid R", "Ashley Moody", 1, "Angie Nixon", 0, "D", 1],
    ["Georgia", "D", "Likely D", "Mike Collins", 0, "Jon Ossoff", 1, "D", 0],
    ["Idaho", "R", "Solid R", "Jim Risch", 1, "Todd Achilles", 0, "I", 0],
    ["Illinois", "D", "Solid D", "Don Tracy", 0, "Juliana Stratton", 0, "D", 0],
    ["Iowa", "R", "Tossup", "Ashley Hinson", 0, "Josh Turek", 0, "D", 0],
    ["Kansas", "R", "Lean R", "Roger Marshall", 1, "Adam Hamilton", 0, "D", 0],
    ["Kentucky", "R", "Solid R", "Andy Barr", 0, "Charles Booker", 0, "D", 0],
    ["Louisiana", "R", "Solid R", "Julia Letlow", 0, "Jamie Davis", 0, "D", 0],
    ["Maine", "R", "Tossup", "Susan Collins", 1, "Troy Jackson", 0, "D", 0],
    ["Massachusetts", "D", "Solid D", "John Deaton", 0, "Ed Markey", 1, "D", 0],
    ["Michigan", "D", "Tossup", "Mike Rogers", 0, "Abdul El-Sayed", 0, "D", 0],
    ["Minnesota", "D", "Likely D", "Michele Tafoya", 0, "Peggy Flanagan", 0, "D", 0],
    ["Mississippi", "R", "Solid R", "Cindy Hyde-Smith", 1, "Scott Colom", 0, "D", 0],
    ["Montana", "R", "Solid R", "Kurt Alme", 0, "Seth Bodnar", 0, "I", 0],
    ["Nebraska", "R", "Likely R", "Pete Ricketts", 1, "Dan Osborn", 0, "I", 0],
    ["New Hampshire", "D", "Tossup", "John E. Sununu", 0, "Chris Pappas", 0, "D", 0],
    ["New Jersey", "D", "Solid D", "Justin Murphy", 0, "Cory Booker", 1, "D", 0],
    ["New Mexico", "D", "Solid D", "Larry Marker", 0, "Ben Ray Luján", 1, "D", 0],
    ["North Carolina", "R", "Lean D", "Michael Whatley", 0, "Roy Cooper", 0, "D", 0],
    ["Ohio", "R", "Tossup", "Jon Husted", 1, "Sherrod Brown", 0, "D", 1],
    ["Oklahoma", "R", "Solid R", "Kevin Hern", 0, "N'Kiyla Jasmine Thomas", 0, "D", 0],
    ["Oregon", "D", "Solid D", "David Brock Smith", 0, "Jeff Merkley", 1, "D", 0],
    ["Rhode Island", "D", "Solid D", "Raymond McKay", 0, "Jack Reed", 1, "D", 0],
    ["South Carolina", "R", "Likely R", "Darline Graham", 1, "Annie Andrews", 0, "D", 0],
    ["South Dakota", "R", "Solid R", "Mike Rounds", 1, "Brian Bengs", 0, "I", 0],
    ["Tennessee", "R", "Solid R", "Bill Hagerty", 1, "Marquita Bradshaw", 0, "D", 0],
    ["Texas", "R", "Tossup", "Ken Paxton", 0, "James Talarico", 0, "D", 0],
    ["Virginia", "D", "Solid D", "Bert Mizusawa", 0, "Mark Warner", 1, "D", 0],
    ["West Virginia", "R", "Solid R", "Shelley Moore Capito", 1, "Rachel Fetty Anderson", 0, "D", 0],
    ["Wyoming", "R", "Solid R", "Harriet Hageman", 0, "James W. Byrd", 0, "D", 0],
  ],
  },
  governor: {
    year: 2026,
    // governors NOT up for election in 2026 (14 states): 6 Democrats, 8 Republicans
    notUp: { D: 6, R: 8 },
    races: [
    ["Alabama", "R", "Solid R", "Tommy Tuberville", 0, "Doug Jones", 0, "D", 0],
    ["Alaska", "R", "Lean R", "Republican field (Bronson, Taylor, Wilson)", 0, "Jonathan Kreiss-Tomkins", 0, "D", 0],
    ["Arizona", "D", "Lean D", "Andy Biggs", 0, "Katie Hobbs", 1, "D", 0],
    ["Arkansas", "R", "Solid R", "Sarah Huckabee Sanders", 1, "Fredrick Love", 0, "D", 0],
    ["California", "D", "Solid D", "Steve Hilton", 0, "Xavier Becerra", 0, "D", 0],
    ["Colorado", "D", "Solid D", "Victor Marx", 0, "Phil Weiser", 0, "D", 0],
    ["Connecticut", "D", "Solid D", "Ryan Fazio", 0, "Ned Lamont", 1, "D", 0],
    ["Florida", "R", "Likely R", "Byron Donalds", 0, "David Jolly", 0, "D", 0],
    ["Georgia", "R", "Tossup", "Rick Jackson", 0, "Keisha Lance Bottoms", 0, "D", 0],
    ["Hawaii", "D", "Solid D", "Gary Cordery", 0, "Josh Green", 1, "D", 0],
    ["Idaho", "R", "Solid R", "Brad Little", 1, "Terri Pickens", 0, "D", 0],
    ["Illinois", "D", "Solid D", "Darren Bailey", 0, "JB Pritzker", 1, "D", 0],
    ["Iowa", "R", "Lean D", "Zach Lahn", 0, "Rob Sand", 0, "D", 0],
    ["Kansas", "D", "Lean R", "Ty Masterson", 0, "Cindy Holscher", 0, "D", 0],
    ["Maine", "D", "Solid D", "Robert B. Charles", 0, "Hannah Pingree", 0, "D", 0],
    ["Maryland", "D", "Solid D", "Dan Cox", 0, "Wes Moore", 1, "D", 0],
    ["Massachusetts", "D", "Solid D", "Mike Minogue", 0, "Maura Healey", 1, "D", 0],
    ["Michigan", "D", "Lean D", "John James", 0, "Jocelyn Benson", 0, "D", 0],
    ["Minnesota", "D", "Solid D", "Lisa Demuth", 0, "Amy Klobuchar", 0, "D", 0],
    ["Nebraska", "R", "Solid R", "Jim Pillen", 1, "Lynne Walz", 0, "D", 0],
    ["Nevada", "R", "Tossup", "Joe Lombardo", 1, "Aaron Ford", 0, "D", 0],
    ["New Hampshire", "R", "Likely R", "Kelly Ayotte", 1, "Cinde Warmington", 0, "D", 0],
    ["New Mexico", "D", "Solid D", "Gregg Hull", 0, "Deb Haaland", 0, "D", 0],
    ["New York", "D", "Solid D", "Bruce Blakeman", 0, "Kathy Hochul", 1, "D", 0],
    ["Ohio", "R", "Tossup", "Vivek Ramaswamy", 0, "Amy Acton", 0, "D", 0],
    ["Oklahoma", "R", "Solid R", "Mike Mazzei", 0, "Cyndi Munson", 0, "D", 0],
    ["Oregon", "D", "Lean D", "Christine Drazan", 0, "Tina Kotek", 1, "D", 0],
    ["Pennsylvania", "D", "Solid D", "Stacy Garrity", 0, "Josh Shapiro", 1, "D", 0],
    ["Rhode Island", "D", "Solid D", "Republican nominee (Guckian or Pelino)", 0, "Helena Foulkes", 0, "D", 0],
    ["South Carolina", "R", "Solid R", "Alan Wilson", 0, "Jermaine Johnson", 0, "D", 0],
    ["South Dakota", "R", "Solid R", "Larry Rhoden", 1, "Dan Ahlers", 0, "D", 0],
    ["Tennessee", "R", "Solid R", "Marsha Blackburn", 0, "Jerri Green", 0, "D", 0],
    ["Texas", "R", "Likely R", "Greg Abbott", 1, "Gina Hinojosa", 0, "D", 0],
    ["Vermont", "R", "Solid R", "Phil Scott", 1, "Amanda Janoo", 0, "D", 0],
    ["Wisconsin", "D", "Tossup", "Tom Tiffany", 0, "David Crowley", 0, "D", 0],
    ["Wyoming", "R", "Solid R", "Eric Barlow", 0, "Kenneth Casner", 0, "D", 0],
  ],
  },
};
if (typeof module !== "undefined") module.exports = RACES;
