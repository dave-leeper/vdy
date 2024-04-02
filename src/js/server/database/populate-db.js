// ONLY USED TO SET UP A FRESH DATABASE.
// start --log debug --user root --pass root memory
// fly apps restart vdydb
const {fileDBCreate, fileDBSelect, fileDBQuery, fileDBDelete} = require(`./file-db-old`)
const {logError, logInfo} = require('../utility/log')

module.exports = {
  /**
   * Populates the database with initial data including admin user, 
   * sample text, photos, news articles, reviews, etc.
   * Async function that calls other helper functions to populate each data type.
   */
  populateDatabase: async function () {
    const Registry = require(`../utility/registry`)

    let db = Registry.get(`FileDBConnection`)

    if (!db) {
      logError(`No DB connection found in registry.`)
      return
    }
    await populateAdmin(db)
    // await populateAnalytics(db)
    await populateText(db)
    await populateUser(db)
    await populatePhoto(db)
    await populateNews(db)
    await populateReviews(db)
  }
}

/**
 * Gets the number of records in the given table in the database.
 * @param {Object} db - The database connection object. 
 * @param {string} table - The name of the table to get the count for.
 * @returns {Promise<number>} A promise that resolves to the number of records.
 */
const getRecordCount = async (db, table) => {
  const countResult = await fileDBQuery(db, ``, { tb: table, })

  return countResult[0].result.length
}

/**
 * Gets all data from the given table in the database.
 * @param {Object} db - The database connection object.
 * @param {string} table - The name of the table to get the data for. 
 * @returns {Promise<Object[]>} A promise that resolves to the table data.
 */
const getTableData = async (db, table) => {
  const text = await fileDBSelect(db, table)

  return text
}

/**
 * Checks if the given table in the database already has data populated.
 * 
 * @param {Object} db - The database connection object
 * @param {string} table - The name of the table 
 * @returns {Promise<boolean>} A promise that resolves to true if table has data, false otherwise.
 */
const isTablePopulated = async (db, table) => {
  const count = await getRecordCount(db, table)

  return 0 < count
}

/**
 * Prints the record count and all data for the given table.
 * 
 * @param {Object} db - The database connection object
 * @param {string} table - The name of the table
 */
const printRecordCountAndData = async (db, table) => {
  const count = await getRecordCount(db, table)
  const data = await getTableData(db, table)
  const output = {
    table,
    count,
    data
  }

  logInfo(output)
}

/**
 * Populates the admin table in the database with default data.
 * 
 * Checks if the table already has data, deletes existing data if so, 
 * and inserts default admin data.
 * 
 * @param {Object} db - The database connection object.
 */
const populateAdmin = async (db) => {
  const table = `admin`
  try {
    const populated = await isTablePopulated(db, table)

    if (populated) {
      await printRecordCountAndData(db, table)
      return
    }
    await fileDBDelete(db, table)
    await fileDBCreate(db, `${table}:0`, {
      lastBackupDate: `never`,
      encryptedGitHubKey: `34ecd3910776ee758f5cc902e8629e192f8d3e8c1495bd17dfdd4b56a4768d6611b4af22b61f4af6c7c99c2a35b75ec2`,
      reservationRequestCounter: 57
    })
    await printRecordCountAndData(db, table)
  } catch (e) {
    logError(`Error populating ${table} table.`, e);
  }
}

/**
 * Populates the analytics table in the database with default data.
 * 
 * Checks if the table already has data, deletes existing data if so,
 * and inserts default analytics data.
 *
 * @param {Object} db - The database connection object.
 */
const populateAnalytics = async (db) => {
  const table = `analytics`
  try {
    const populated = await isTablePopulated(db, table)

    if (populated) {
      await printRecordCountAndData(db, table)
      return
    }
    await fileDBDelete(db, table)
    await fileDBCreate(db, `${table}:0`, {
      reservationRequestCounter: 1000,
      reservationRequestInvalidDataCounter: 0,
      reservationRequestFailedCounter: 0,
      quoteRequestCounter: 1000,
      quoteRequestInvalidDataCounter: 0,
      quoteRequestFailedCounter: 0,
      homePageCounter: 0,
      reservationPageCounter: 0,
      photosPageCounter: 0,
      reviewsPageCounter: 0
    })
    await printRecordCountAndData(db, table)
  } catch (e) {
    logError(`Error populating ${table} table.`, e);
  }
}

/**
 * Populates the text table in the database with default data.
 * 
 * Checks if the table already has data, deletes existing data if so, 
 * and inserts default text data for the about and reviews pages.
 */
const populateText = async (db) => {
  const table = `text`
  try {
    const populated = await isTablePopulated(db, table)
    const reviewTextParagraph1 = `A word about my service, my website is new, my service is not. The first 48 reviews were brought in from my Yelp ad and my Google Business page. `
    const reviewTextParagraph2 = `All of my initial reviews have been imported exactly as they were written and I'm unable to edit them. `
    const reviewTextParagraph3 = `As for my replies, I make mistakes, yes I'm human, so I'm able to edit my replies. `
    const reviewTextParagraph4 = `Thanks so much for being here and I hope you like my reviews\n\n`
    const reviewTextParagraph5 = `Vince`
    const reviewText = `${reviewTextParagraph1}${reviewTextParagraph2}${reviewTextParagraph3}${reviewTextParagraph4}${reviewTextParagraph5}`

    if (populated) {
      await printRecordCountAndData(db, table)
      return
    }
    await fileDBDelete(db, table)
    await fileDBCreate(db, `${table}:0`, {
      for: `about`,
      text: `Vince Drives You is a Luxury SUV Transportation Service serving the Valley of the Sun. Advance reservations are required. I have an on-time pickup guarantee which means if you're not picked up on time you get a $50 discount on that trip, not a future credit. You can't do better anywhere.\n\nIf you are looking for a spacious, clean and comfortable trip then calling me is the only number you need to know. Rates start at a minimum charge of $60 and hourly packages are available. Hourly rates start at $90 per hour with a 3- hour minimum for a Black Suburban. I now have a Mercedes Sprinter with an 15 passenger capacity (including driver) available for larger party pick ups at the airport or your special event. The Sprinter starts at $150 per hour with a 4- hour minimum or you can get point to point service for only $250 in the Valley Metro area. You will know your full fee before your trip is confirmed regardless of how far in advance your service is booked and there are never hidden fees or charges.`,
    })
    await fileDBCreate(db, `${table}:1`, {
      for: `reviews`,
      text: reviewText,
    })
    await printRecordCountAndData(db, table)
  } catch (e) {
    logError(`Error populating ${table} table.`, e);
  }
}

/**
 * Populates the user table in the database with default admin and business owner users.
 * 
 * Checks if the table already has data, deletes existing data if so,
 * and inserts default user records for admin and business owner roles.
 */
const populateUser = async (db) => {
  const table = `user`
  try {
    const populated = await isTablePopulated(db, table)

    if (populated) {
      await printRecordCountAndData(db, table)
      return
    }
    await fileDBDelete(db, table)
    await fileDBCreate(db, `${table}:0`, {
      userName: `Admin`,
      name: {
        first: `Admin`,
        last: `Admin`
      },
      title: `Admin`,
      password: `Admin`,
      roles: [`Admin`],
    })
    await fileDBCreate(db, `${table}:1`, {
      userName: `Vincent`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      title: `Business Owner`,
      password: `Vincent`,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      roles: [`Admin`],
    })
    await printRecordCountAndData(db, table)
  } catch (e) {
    logError(`Error populating ${table} table.`, e);
  }
}

/**
 * Populates the photo table in the database with default photo records.
 * 
 * Checks if the table already has data, deletes existing data if so,
 * and inserts default photo records.
 */
const populatePhoto = async (db) => {
  const table = `photo`
  try {
    const populated = await isTablePopulated(db, table)

    if (populated) {
      await printRecordCountAndData(db, table)
      return
    }
    await fileDBDelete(db, table)
    await fileDBCreate(db, `${table}:8`, { text: `Alcantara Vineyards and Winery.`, file: `photo8.jpg` })
    await fileDBCreate(db, `${table}:7`, { text: `Girls just want to have fun and Vince Drives You helps to make that possible.`, file: `photo7.jpg` })
    await fileDBCreate(db, `${table}:6`, { text: `Feel like a trip to Carlsbad, Ca. Vince Drives You can get you there.`, file: `photo6.jpg` })
    await fileDBCreate(db, `${table}:5`, { text: `Five lovely ladies from France with me on a 3-day tour through Arizona, Utah and Nevada.`, file: `photo5.jpg` })
    await fileDBCreate(db, `${table}:4`, { text: `A new member to the service.`, file: `photo4.jpg` })
    await fileDBCreate(db, `${table}:3`, { text: `More time in the red rocks.`, file: `photo3.jpg` })
    await fileDBCreate(db, `${table}:2`, { text: `Ready for adventure.`, file: `photo2.jpg` })
    await fileDBCreate(db, `${table}:1`, { text: `Presidential Service.`, file: `photo1.jpg` })
    await fileDBCreate(db, `${table}:0`, { text: `Enjoy a stress free trip to the red rocks of Sedona.`, file: `photo0.jpg` })
    await printRecordCountAndData(db, table)
  } catch (e) {
    logError(`Error populating ${table} table.`, e);
  }
}

/**
 * Populates the news table in the database with default news records.
 * 
 * Checks if the table already has data, deletes existing data if so,
 * and inserts default news records.
 */
const populateNews = async (db) => {
  const table = `news`
  try {
    const populated = await isTablePopulated(db, table)

    if (populated) {
      await printRecordCountAndData(db, table)
      return
    }
    await fileDBDelete(db, table)
    await fileDBCreate(db, `${table}:0`, { title: `Visiting the red rocks of Sedona.`, text: `Phoenix Sky Harbor to Sedona, up to 6 passengers plus luggage for only $300 one way. Call Vince at (602) 545-8557 to schedule your trip.`, file: `news0.jpg` })
    await fileDBCreate(db, `${table}:1`, { title: `On time pickup guaranteed.`, text: `Nobody has a better on time record. Period.`, file: `news1.jpg` })
    await fileDBCreate(db, `${table}:2`, { title: `We specialize in luxury SUV service.`, text: `Give us a call at (602) 545-8557 to book an appointment. We're always happy to chat about options and pricing.`, file: `news2.jpg` })
    await fileDBCreate(db, `${table}:3`, { title: `Pick up that phone.`, text: `Calling me at (602) 545-8557 is the first and best step to having your transportation needs professionally taken care of.`, file: `news3.jpg` })
    await fileDBCreate(db, `${table}:4`, { title: `White shirt and tie? I'm not your guy!`, text: `But if you are looking for a relaxed, comfortable, 5-star ride then give me a call and I can handle all your transportation needs.`, file: `news4.jpg` })
    await fileDBCreate(db, `${table}:5`, { title: `Looking for some cool ocean breezes?`, text: `How does a trip to the coast in Carlsbad, CA sound? Yes, we do that also. Call Vince for more information. Call (602) 545-8557.`, file: `news5.jpg` })
    await fileDBCreate(db, `${table}:6`, { title: `New fleet addition, book now.`, text: `New Mercedes Sprinter 15 passenger van has arrived. It’s time to book your special event. Call (602) 545-8557`, file: `news6.jpg` })
    await printRecordCountAndData(db, table)
  } catch (e) {
    logError(`Error populating ${table} table.`, e);
  }
}

const populateReviews = async (db) => {

  const table = `review`
  try {
    const populated = await isTablePopulated(db, table)

    if (populated) {
      await printRecordCountAndData(db, table)
      // return 
    }
    await fileDBDelete(db, table)    
    
    await fileDBCreate(db, `${table}:99`, {
      image: `https://s3-media0.fl.yelpcdn.com/photo/F2mrC8K49cjSDOZWPh0ECA/60s.jpg`,
      name: {
        first: `Joshua`,
        last: `C.`
      },
      date: `02/09/2024`,
      city: `Glendale`,
      state: `AZ`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0, 
      review: `I had stopped flying pre-COVID but recently ran into a situation where I needed to. I've personally never used Lyft/Uber-type services and certainly didn't want to start with a 4:00am pickup for the airport. I was unable to secure a backup ride for both sides of my trip, so started looking into other options when I came across Vince Drives You.\n\nAll I can say is the entire experience from pre-booking inquiries to arriving home after my return flight was perfect on every level. Vince quickly responded to a website inquiry and we quickly began to text. All rates were locked in ahead of time and he was always within reach if changes were made to flight itinerary or just confirming we were set after the long gap between booking and day of.\n\nBrendan was my driver to the airport and arrived at 4:00am on the nose. He was super personable and bent over backwards to ensure there was nothing I wanted or needed on the journey. Even when road construction had the would-be exit closed, he quickly knew where to pivot in order to still arrive on time.\n\nVince himself picked me up for the ride home. The Waste Management Open was kicking off so traffic was heavier than usual with rain coming down to boot. He easily navigated the obstacles in order to keep things moving along and was equally as friendly and knowledgeable in all capacities.\n\nWhile airport transportation service obviously comes to mind for a business such as this, I would recommend keeping it in mind for anything from a game night out, date night dinner reservation, parties, etc. It is certainly much nicer and more reliable than an Uber or Lyft and likely much cheaper than a cab or limo service. This was a flawless transaction and I would highly recommend (and certainly use again myself) Vince Drives You for any type of shuttling needs.`
    })
    await fileDBCreate(db, `${table}:98`, {
      replyingTo: 99,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `02/09/2024`,
      title: `Business Owner`,
      reply: `Wow, thanks Joshua, I really appreciate your kind words. I enjoyed the ride with you and the conversation was great. It's my goal to be the best car service in The Valley and customers like yourself are the reason we are here. I look forward to the next time you travel, whatever the reason. Vince`
    })

    await fileDBCreate(db, `${table}:97`, {
      image: `https://s3-media0.fl.yelpcdn.com/photo/UlINnggduOHbMWACpRL__A/60s.jpg`,
      name: {
        first: `Kelly `,
        last: `Rienzo`
      },
      date: `12/31/2023`,
      city: `Google`,
      state: `Business`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0, 
      review: `My family always calls Vince when we need a ride to the airport. He is always on time and professional. His vehicles are luxurious and clean.`
    })
    await fileDBCreate(db, `${table}:96`, {
      replyingTo: 97,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `12/31/2023`,
      title: `Business Owner`,
      reply: `Thanks Kelly, it's always a pleasure working with you and look forward to the next time.\n\nHappy Holidays to you and yours.`
    })

    await fileDBCreate(db, `${table}:95`, {
      image: `https://s3-media0.fl.yelpcdn.com/photo/UlINnggduOHbMWACpRL__A/60s.jpg`,
      name: {
        first: `Nancy`,
        last: `R`
      },
      date: `4/25/2023`,
      city: `Solomons`,
      state: `MD`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0, 
      review: `Vince was 15 min early for a 3:30am pickup and shuttle from Sun City West to the airport. Loaded all our 8 bags/golf clubs and was so courteous and kind.\\n\\nSuburban was extremely comfortable.\\n\\nVery professional.`
    })

    await fileDBCreate(db, `${table}:94`, {
      image: `https://s3-media0.fl.yelpcdn.com/photo/UlINnggduOHbMWACpRL__A/60s.jpg`,
      name: {
        first: `Dan`,
        last: `Z`
      },
      date: `10/3/2023`,
      city: `Annapolis`,
      state: `MD`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0, 
      review: `We used this service for a short ride from our hotel in downtown Tempe to Sky Harbor. Vince arrived 15 minutes early. The car was comfortable and spotless and Vince's service was both friendly and professional. I have no hesitation in recommending "Vince Drives You."`
    })
    await fileDBCreate(db, `${table}:93`, {
      replyingTo: 94,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `6/30/2023`,
      title: `Business Owner`,
      reply: `Thanks Dan, it was a pleasure meeting you. Hope to see you again in the future.`
    })

    await fileDBCreate(db, `${table}:92`, {
      image: `https://s3-media0.fl.yelpcdn.com/photo/UlINnggduOHbMWACpRL__A/60s.jpg`,
      name: {
        first: `Mariam`,
        last: `A`
      },
      date: `6/30/2023`,
      city: `Tempe`,
      state: `AZ`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0, 
      review: `Great service! Vince was quick to respond and got me scheduled immediately. Brendon was great and super kind, and he arrived on time. We used their service to and from the airport. It was great having Brendon as our driver, he arrived on time and the whole process was so smooth. The suburban was so comfortable especially for our 7 month old baby, where we were able to use our own car seat. We are so thankful we found quality and great car service! I'll definitely be using them again!`
    })
    await fileDBCreate(db, `${table}:91`, {
      replyingTo: 92,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `6/30/2023`,
      title: `Business Owner`,
      reply: `Thanks so much for the kind words, it’s my goal to have every trip go that well. I hope to meet you personally someday in the future. Vince`
    })

    await fileDBCreate(db, `${table}:90`, {
      image: `https://s3-media0.fl.yelpcdn.com/photo/bWxcmCbNUI1Z0STygLNQ3A/60s.jpg`,
      name: {
        first: `Jane`,
        last: `L`
      },
      date: `10/13/2023`,
      city: `Wilton`,
      state: `CA`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0, 
      review: `Vince was early for my pickup and was courteous and helpful. He went out of his way to make sure I received good service from him and I really appreciated it.`
    })
    await fileDBCreate(db, `${table}:89`, {
      replyingTo: 90,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `10/13/2023`,
      title: `Business Owner`,
      reply: `Thank you so much, it was my pleasure.`
    })

    await fileDBCreate(db, `${table}:88`, {
      image: `https://s3-media0.fl.yelpcdn.com/photo/bWxcmCbNUI1Z0STygLNQ3A/60s.jpg`,
      name: {
        first: `Andrea`,
        last: `P`
      },
      date: `10/24/2023`,
      city: `Avondale`,
      state: `AZ`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0, 
      review: `Vince was prompt in responding to my request for a quote. He answered within 15 minutes. The day of, Tawni messaged me while I was still on the plane. She was able to help stop traffic when I couldn't get across, and immediately had me ready to leave. There was water in the car, I could make the car nice and chilly, and we had a wonderful conversation. The car was also spotless and extremely comfortable.
      With tip, the ride from the airport to San Tan was cheaper than I've paid during Uber at high times. If I had to book a bigger car due to luggage, I think Vince's ride would be cheaper. And there was zero hassle. I didn't have to worry about a thing. Thank you Tawni, and thank you Vince for making my ride home very smooth.
      I look forward to booking with you again the next time that we need a ride to the airport.`
    })
    await fileDBCreate(db, `${table}:87`, {
      replyingTo: 88,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `10/24/2023`,
      title: `Business Owner`,
      reply: `Thank you Andrea.\\n\\nTawni has become an excellent addition to our service and helps to carry on with our goal to be the best service in the Valley. I look forward to next time.`
    })






    await fileDBCreate(db, `${table}:86`, {
      name: {
        first: `Janet`,
        last: `S`
      },
      date: `5/6/2023`,
      city: `Freeport`,
      state: `PA`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0, 
      review: `Picked us up at airport in Phoenix.  Contacted me while we were still on the plane that he was in the area even though we were early getting in. After we got our bags, we walked out to meet him and he was there waiting. So easy. Our driver was Brendan who was so nice and personable. He drove us to our destination while engaging in pleasant conversation.  I would definitely use this service again if in the area. Top notch service!`
    })
    await fileDBCreate(db, `${table}:85`, {
      name: {
        first: `Jane`,
        last: `S`
      },
      date: `5/6/2023`,
      city: `San Francisco`,
      state: `CA`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0, 
      review: `Vince was wonderful. He arrived early.\\nHe was professional and courteous.\\nI recommend his car service as one of the best I have experienced.`
    })
    await fileDBCreate(db, `${table}:84`, {
      name: {
        first: `Francine`,
        last: `S`
      },
      date: `5/6/2023`,
      city: `Winnetka`,
      state: `CA`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0, 
      review: `Great experience Will definitely use him again He was waiting for us to bring us home.`
    })
    await fileDBCreate(db, `${table}:83`, {
      replyingTo: 84,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `5/6/2023`,
      title: `Business Owner`,
      reply: `But, of course, Francine, that’s what I do. Thanks.`
    })
    await fileDBCreate(db, `${table}:82`, {
      name: {
        first: `Joan`,
        last: `N`
      },
      date: `4/19/2023`,
      city: `Newport Beach`,
      state: `CA`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0, 
      review: `We used Vince to take our family from Anthem to Sky Harbor and return.  The service was 5 star - easy communication to confirm our schedule, arrived  on time with a bit to spare and got us to our destination in comfort.  It's all you would want in transportation - and oh! the price was fair and reasonable.  Payment was simple using Zelle.  We would highly recommend this service.`
    })
    await fileDBCreate(db, `${table}:81`, {
      replyingTo: 82,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `4/19/2023`,
      title: `Business Owner`,
      reply: `Thanks so much Joan, it was a real pleasure and if there’s anything I can help you with in the future, please don’t hesitate to call me personally. Vince.`
    })
    await fileDBCreate(db, `${table}:80`, {
      name: {
        first: `Mildred`,
        last: `Thurston`
      },
      date: `3/23/2023`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Vince came to our rescue very late at night when we were stranded, unable to secure our originally planned method of transportation, with three kids after a very busy concert! He was kind, calm and provided exceptional service at a very reasonable price. We will absolutely be booking him again (ahead of time) the next time we are in the area. Thank you Vince!`
    })
    await fileDBCreate(db, `${table}:79`, {
      replyingTo: 80,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `3/23/2023`,
      title: `Business Owner`,
      reply: `Hi Mildred, I’m just glad that I was able to help and got you back to your hotel safely. I look forward to hearing from you again. `
    })
    await fileDBCreate(db, `${table}:78`, {
      name: {
        first: `Candace`,
        last: `G`
      },
      date: `3/15/2023`,
      city: `Hightstown`,
      state: `NJ`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `I contacted Vince for last minute travel. His response was quick.  Brendan was our driver. He was prompt and friendly. Our flight was delayed due to an emergency on the runway but he was waiting when the plane was finally given clearance to use the gate.  By this time, it was the middle of the night. Truly appreciated having reliable transportation upon arrival. Would highly recommend them!`
    })
    await fileDBCreate(db, `${table}:77`, {
      replyingTo: 78,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `3/15/2023`,
      title: `Business Owner`,
      reply: `Thanks Candace, always my pleasure.`
    })
    await fileDBCreate(db, `${table}:76`, {
      name: {
        first: `Hannah`,
        last: `N`
      },
      date: `3/11/2023`,
      city: `San Diego`,
      state: `CA`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Vince is the man!!! Responsive, super reliable, prompt and friendly. I'm saving Vince as my go-to driver anytime I'm in AZ (usually for Padres Spring Training). He accommodated and navigated seamlessly all our car seat requests, luggage, scheduling and airport finagling. Clean vehicle and our 5 year old even napped on the ride (that's NEVER happened!!) THANK YOU VINCE! You're the best!`
    })
    await fileDBCreate(db, `${table}:75`, {
      replyingTo: 76,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `3/12/2023`,
      title: `Business Owner`,
      reply: `Thanks Hannah, you guys were great fun to ride with and I look forward to the next time. I’m glad we met.`
    })
    await fileDBCreate(db, `${table}:74`, {
      name: {
        first: `Joey`,
        last: `Windham`
      },
      date: `1/25/2022`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Awesome guy was on the money with being on time took me and my daughter our first daddy daughter dance and just made it that much easier for us`
    })
    await fileDBCreate(db, `${table}:73`, {
      replyingTo: 74,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `1/26/2022`,
      title: `Business Owner`,
      reply: `Glad I was able to help make your night just a little bit easier and I enjoyed our conversation. Thanks and I’ll see you next time.`
    })
    await fileDBCreate(db, `${table}:72`, {
      name: {
        first: `Jenna`,
        last: `Miller`
      },
      date: `9/21/2022`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `I️ stumbled across Vince’s Google listing and couldn’t have been happier with the experience. Our transportation to and from the airport was seamless - he was quick and easy to communicate with and flexible with some flight delays and time changes. I️ was anxious about getting to the airport on time for a super early morning flight (needed to be picked up at 3:30am) and didn’t want to have to rely on being able to find a ride share option at that time of day. He was on time (actually, early!) and his vehicle was always spotless! Thanks Vince!`
    })
    await fileDBCreate(db, `${table}:71`, {
      replyingTo: 72,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `9/22/2022`,
      title: `Business Owner`,
      reply: `Thanks for the kind words Jenna, it was truly a pleasure working with you and I hope to be able to serve you again somewhere down the road.`
    })
    await fileDBCreate(db, `${table}:70`, {
      name: {
        first: `Jeff`,
        last: `Zook`
      },
      date: `8/14/2022`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Got Vince as a chance encounter and now I only use him wherever I travel to. He’s always early, super clean vehicle, and makes you feel comfortable as a passenger.`
    })
    await fileDBCreate(db, `${table}:69`, {
      replyingTo: 70,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `8/15/2022`,
      title: `Business Owner`,
      reply: `Thanks Jeff, I always enjoy giving you, your family and friends a ride. Great conversation and a laugh or two.`
    })
    await fileDBCreate(db, `${table}:68`, {
      name: {
        first: `Christine`,
        last: `Ferrell`
      },
      date: `5/29/2022`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Vince is always prompt and friendly! Fantastic Driver for any need. I have used for events and airport drop offs always on time and a spotless ride. Definitely recommend.`
    })
    await fileDBCreate(db, `${table}:67`, {
      replyingTo: 68,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `5/30/2022`,
      title: `Business Owner`,
      reply: `Thanks Christine, I’ll see you again next time.`
    })
    await fileDBCreate(db, `${table}:66`, {
      name: {
        first: `Joseph`,
        last: `Early`
      },
      date: `3/14/2022`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Using Vince's services provided me with safe, reliable and affordable private transportation. Vince is a spectacular driver, conversationalist, and company. He has a nice, clean and overall cool vehicle. I highly recommend his services, I will be a repeat client. Thanks Vince!`
    })
    await fileDBCreate(db, `${table}:65`, {
      replyingTo: 66,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `3/15/2022`,
      title: `Business Owner`,
      reply: `Thanks Joseph, it was a pleasure driving you around last night and that cigar was great. You rock!`
    })
    await fileDBCreate(db, `${table}:64`, {
      name: {
        first: `Aaron`,
        last: `Harding`
      },
      date: `12/14/2021`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Vince saved our bacon! We were left stranded by Uber and Vince stepped in on short notice, getting us to the airport with just seconds to spare!!! We are forever grateful and would recommend him to anyone!!! We will be calling him again next time we are in the area!`
    })
    await fileDBCreate(db, `${table}:63`, {
      replyingTo: 64,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `12/15/2021`,
      title: `Business Owner`,
      reply: `Thanks for the review, glad I was able to get you there on time and I hope you had a pleasant flight home.`
    })
    await fileDBCreate(db, `${table}:62`, {
      name: {
        first: `Victoria`,
        last: `Griego`
      },
      date: `2/6/2022`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Vince is a very polite, professional and safe driver.\\n\\nHe picked me up right on time.\\n\\nHe keeps his vehicle spotless.\\n\\nI will definitely be calling him again.`
    })
    await fileDBCreate(db, `${table}:61`, {
      replyingTo: 62,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `2/7/2022`,
      title: `Business Owner`,
      reply: `Thanks Victoria, looking forward to the next trip.`
    })
    await fileDBCreate(db, `${table}:60`, {
      name: {
        first: `Stephanie`,
        last: `Hafner`
      },
      date: `2/11/2022`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Vince is our driver whenever we are in AZ. He is dependable, punctual, and friendly. Vince has become part of our AZ family. His vehicle is always clean on the inside and the outside. Vince checks our flights and knows if we are arriving early or late and he compensates to ensure that he is there waiting outside baggage claim when we arrive. Vince is a great driver, which is super important to me as I am prone to motion sickness in vehicles. If you are in the AZ area and looking for an incredible driver then Vince is your man!`
    })
    await fileDBCreate(db, `${table}:59`, {
      replyingTo: 60,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `2/12/2022`,
      title: `Business Owner`,
      reply: `Thanks Stephanie, I always look forward to your visits here. It's a real pleasure driving you and your family around.`
    })
    await fileDBCreate(db, `${table}:58`, {
      name: {
        first: `Brendan`,
        last: `Gallagher`
      },
      date: `1/29/2021`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `I have used Vince's services quite a few times and am always very pleased.  Exceptional service, always punctual and a very pleasant gentleman as well. I will continue to use Vince   Drives You anytime I need a ride and highly recommend his services. Thanks Vince!`
    })
    await fileDBCreate(db, `${table}:57`, {
      replyingTo: 58,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `1/30/2021`,
      title: `Business Owner`,
      reply: `Thanks Brendan, I see you didn’t say how much I paid you for that review. Just kidding, always appreciate your business.`
    })
    await fileDBCreate(db, `${table}:56`, {
      name: {
        first: `Daryll`,
        last: `Hindman`
      },
      date: `3/3/2021`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `I called Vince Drives you, and was pleasantly surprised when Vince was my actual driver that picked me up. He's professional, courteous, covid conscious, the vehicle was roomy and clean. I highly recommend Vince as my go-to driver Everytime I fly in to Phoenix, which is usually 3 times a month.`
    })
    await fileDBCreate(db, `${table}:55`, {
      replyingTo: 56,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `3/4/2021`,
      title: `Business Owner`,
      reply: `Thanks Daryll, I look forward to being of service the next time you’re in Phoenix.`
    })
    await fileDBCreate(db, `${table}:54`, {
      name: {
        first: `Donna`,
        last: `Fiore`
      },
      date: `1/28/2022`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Vince is second to none when it comes to professionalism! His luxurious vehical is Impecable and smells amazing. Our hour and a half drive together was pleasant and warm.\\nVince Your 10 STARS  ********** in my Book.\\nThank you for the drive!`
    })
    await fileDBCreate(db, `${table}:53`, {
      replyingTo: 54,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `1/29/2022`,
      title: `Business Owner`,
      reply: `Wow, 10 stars. Thank you so much. Hope to be able to be of service to you again in the future.`
    })
    await fileDBCreate(db, `${table}:52`, {
      name: {
        first: `Keith`,
        last: `V`
      },
      date: `2/2/2022`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `I dont usual Lyft to airport but Vince was our ride from house.  So glad he gave me his card.  We will use Vince again and again in the future.  Thanks Vince.  Great Ride`
    })
    await fileDBCreate(db, `${table}:51`, {
      replyingTo: 52,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `2/3/2022`,
      title: `Business Owner`,
      reply: `Thanks Keith, glad you enjoyed the service. See you next time.`
    })
    await fileDBCreate(db, `${table}:50`, {
      name: {
        first: `RICHARD E`,
        last: `VOIGHT JR`
      },
      date: `2/26/2021`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `I used Vince's service a few times now. Very high class & roomy vehicle, Vince was prompt & on time, reasonable rates, would highly recommend, Thank you for your service,  Rich`
    })
    await fileDBCreate(db, `${table}:49`, {
      replyingTo: 50,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `2/27/2021`,
      title: `Business Owner`,
      reply: `Thanks Rich, I look forward to working with you again soon.`
    })
    await fileDBCreate(db, `${table}:48`, {
      name: {
        first: `Britney`,
        last: `Barragan`
      },
      date: `10/14/2022`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `This gentleman has class. Will definitely be returning clients!`
    })
    await fileDBCreate(db, `${table}:47`, {
      replyingTo: 48,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `10/15/2022`,
      title: `Business Owner`,
      reply: `Much appreciated, looking forward to the next time.`
    })
    await fileDBCreate(db, `${table}:46`, {
      name: {
        first: `Kevin`,
        last: `Cooney`
      },
      date: `2/14/2022`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Vince is an absolute professional and one of his best attributes is his timeliness. I would highly suggest Vince to anyone in the Phoenix area.`
    })
    await fileDBCreate(db, `${table}:45`, {
      replyingTo: 46,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `2/14/2022`,
      title: `Business Owner`,
      reply: `Thanks Kevin, I’ll try and be late next time. Just kidding, see you in a few weeks.`
    })
    await fileDBCreate(db, `${table}:44`, {
      name: {
        first: `Nick`,
        last: `Seevers`
      },
      date: `2/02/2022`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Absolutely great ride. One of the cleanest vehicles I’ve been in for a car service. Shows up on time, extremely knowledgeable and professional.`
    })
    await fileDBCreate(db, `${table}:43`, {
      replyingTo: 44,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `2/03/2022`,
      title: `Business Owner`,
      reply: `Thanks Nick, I’ll see you for Spring Training again next year.`
    })
    await fileDBCreate(db, `${table}:42`, {
      name: {
        first: `Dru`,
        last: `Mundorff`
      },
      date: `1/12/2021`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `On time and Vehicle clean! Best service in town!`
    })
    await fileDBCreate(db, `${table}:41`, {
      replyingTo: 42,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `1/13/2021`,
      title: `Business Owner`,
      reply: `Thanks for the compliment, I’ll see you next time.`
    })
    await fileDBCreate(db, `${table}:40`, {
      name: {
        first: `Rita`,
        last: `Scheiring`
      },
      date: `2/9/2021`,
      city: ``,
      state: ``,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `5 stars!`
    })
    await fileDBCreate(db, `${table}:39`, {
      replyingTo: 40,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `2/10/2021`,
      title: `Business Owner`,
      reply: `Thanks for the rating, it’s greatly appreciated.`
    })
    await fileDBCreate(db, `${table}:38`, {
      name: {
        first: `Bri`,
        last: `L`
      },
      date: `1/9/2023`,
      city: `Mesa`,
      state: `AZ`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `I contacted Vince really early in the morning for a same day service to go from PHX to Cottonwood. He responded right away and luckily he had a gap in his schedule and was able to squeeze me in. He picked me up within a few hours and drove me 2.5 hours into the steep mountain!! (Sorry Vince) I was able to bring my puppy while I kept him in his kennel. His truck is really nice and it truly felt sophisticated and of quality. Definitely will be booking again and highly recommend to everyone!`
    })
    await fileDBCreate(db, `${table}:37`, {
      replyingTo: 38,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `1/10/2023`,
      title: `Business Owner`,
      reply: `Hi Brianna, I remember that trip well, it was actually to Crown King. I had never been there before and it’s quite beautiful once you get back there. It had recently snowed on the roads were a mess, more for a keep than a luxury SUV, but it was a pleasant trip and we had great conversations on the way. For me, a one-time experience as I won’t be driving back into there again without a four wheel drive vehicle.`
    })
    await fileDBCreate(db, `${table}:36`, {
      name: {
        first: `Leilani`,
        last: `R`
      },
      image: `https://s3-media0.fl.yelpcdn.com/photo/8pSfhZJpo1seiuMSysF9iQ/60s.jpg`,
      date: `1/22/2023`,
      city: `Peoria`,
      state: `AZ`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `We booked Vince Drives You the later part of December and first part of January - Brendan was our driver.  What a great trip to the airport - Brendan arrived a few minutes early, helped us load the SUV and got us to the airport with great conversation and professional driving! I HIGHLY recommend this car service!!`
    })
    await fileDBCreate(db, `${table}:35`, {
      replyingTo: 36,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `1/23/2023`,
      title: `Business Owner`,
      reply: `Thank you, Leilani, I'm extremely proud to have Brendan as a part of the Vince Drives You team. I have your booking request for rides in the future and will process them this morning, it's my pleasure to be of service to you. Vince`
    })
    await fileDBCreate(db, `${table}:34`, {
      name: {
        first: `Chip`,
        last: `..`
      },
      date: `2/23/2023`,
      city: `San Francisco`,
      state: `CA`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `On time and patient, as Sky Harbor takes forever getting your luggage.  Very friendly ride to hotel.  It's the way car service use to be.`
    })
    await fileDBCreate(db, `${table}:33`, {
      replyingTo: 34,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `2/24/2023`,
      title: `Business Owner`,
      reply: `Thanks for your business Chip, Brendan said you were great customers and I look forward to helping you again soon. Vince`
    })
    await fileDBCreate(db, `${table}:32`, {
      name: {
        first: `Melissa`,
        last: `W`
      },
      image: `https://s3-media0.fl.yelpcdn.com/photo/LlYmYwXPawU65kSsVM8XGw/60s.jpg`,
      date: `1/10/2023`,
      city: `Thousand Oaks`,
      state: `CA`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Vince was great! My plane arrived early and he was already there waiting. I also randomly ran into my brother on the plane and he was able to take him as well. I will definitely use Vince if I'm ever in the area again. Thank you!`
    })
    await fileDBCreate(db, `${table}:31`, {
      replyingTo: 32,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `1/10/2023`,
      title: `Business Owner`,
      reply: `Thanks for the kind words, it was my pleasure taking care of you and your brother. I look forward to the next time.`
    })
    await fileDBCreate(db, `${table}:19`, {
      name: {
        first: `Doug`,
        last: `R`
      },
      date: `12/21/2022`,
      city: `Phoenix`,
      state: `AZ`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Brendan was early for the arrival time and super pleasant. The car was spacious and clean. And their prices were very fair.`
    })
    await fileDBCreate(db, `${table}:18`, {
      name: {
        first: `Paul`,
        last: `F`
      },
      date: `11/24/2022`,
      image: `https://s3-media0.fl.yelpcdn.com/photo/47aMH3JCwb6mhV8Yaxti0g/60s.jpg`,
      city: `San Jose`,
      state: `CA`,
      stars: 5,
      usefulCount: 1,
      funnyCount: 0,
      coolCount: 1,
      review: `I needed a car service for for a busy weekend trip to and from Phoenix airport.  Living in North Phoenix that's a 30-40min drive with basic traffic.  I opted with Vince based on his quick communication, rating and price; glad I did! \\n\\nLikes:\\nSafe driving \\nCommunication (I had to change schedule a few days out) Keep in mind he drives and text or calls maybe delayed as driving and with customers) \\nClean SUV \\nTalkative and super friendly \\nCompetitive rate \\nTakes cash, Zelle and PayPal. \\nSmall business owned (it's him and one other driver at this time) \\n\\nDislikes:\\nNone. \\n\\nPro tip:\\nAsk Vince about his 3 week cross country motorcycle trip from 2 years ago!  ;)`
    })
    await fileDBCreate(db, `${table}:17`, {
      name: {
        first: `Wayne`,
        last: `U`
      },
      date: `11/20/2022`,
      image: `https://s3-media0.fl.yelpcdn.com/photo/y9klipSkiZIGdRv98EKq5A/60s.jpg`,
      city: `Scottsdale`,
      state: `AZ`,
      stars: 5,
      usefulCount: 1,
      funnyCount: 0,
      coolCount: 1,
      review: `Arrived ahead of time in clean and spacious vehicle. Got to airport in plenty of time. No drama. Will use again.`
    })
    await fileDBCreate(db, `${table}:16`, {
      name: {
        first: `Lea`,
        last: `C`
      },
      date: `6/1/2022`,
      image: `https://s3-media0.fl.yelpcdn.com/photo/v6jfT5gXqNYoSYBiNe6Kpg/60s.jpg`,
      city: `Phoenix`,
      state: `AZ`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `We hired Vince to pick us up at home to airport.. and then a month later to collect us at the airport and take us home. \\n\\nNot only did he arrive right on time for our VERY early pick up to the airport, but a month later, when we had schedule changes to get home, he was super accommodating and made sure we were picked up on time. \\n\\nWe will definitely use this service again.`
    })
    await fileDBCreate(db, `${table}:15`, {
      name: {
        first: `Nancy`,
        last: `W`
      },
      date: `11/1/2022`,
      image: `https://s3-media0.fl.yelpcdn.com/photo/bWxcmCbNUI1Z0STygLNQ3A/60s.jpg`,
      city: `Ojai`,
      state: `CA`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `prompt, courteous, nice sedans, affordable. Will use  again. Safe way for 10 ladies to travel to the Margarita festive`
    })
    await fileDBCreate(db, `${table}:14`, {
      name: {
        first: `Andrea`,
        last: `D`
      },
      date: `8/19/2022`,
      image: `https://s3-media0.fl.yelpcdn.com/photo/QpNCQIcbe2P7sMZTj2RT7w/60s.jpg`,
      city: `Scottsdale`,
      state: `AZ`,
      stars: 5,
      usefulCount: 1,
      funnyCount: 0,
      coolCount: 0,
      review: `Vince was quick to respond and great at communicating and firming up plans. He arrived early and was a great host. Rates were reasonable, his suburban was clean and showed well. Highly recommend.`
    })
    await fileDBCreate(db, `${table}:13`, {
      name: {
        first: `Greg`,
        last: `K`
      },
      date: `6/18/2022`,
      image: `https://s3-media0.fl.yelpcdn.com/photo/CNi5EOllaZyH3O12WKN0tA/60s.jpg`,
      city: `Goodyear`,
      state: `AZ`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Great guy and we chatted the entire trip.`
    })
    await fileDBCreate(db, `${table}:12`, {
      name: {
        first: `Jenna`,
        last: `M`
      },
      date: `3/30/2022`,
      image: `https://s3-media0.fl.yelpcdn.com/photo/HFmBijAeemsnHF3XJNF2aw/60s.jpg`,
      city: `Shoshone`,
      state: `ID`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Vince was very accommodating. He tracked our flight and arrived early as our flight was early. His vehicle is very clean and the trip to our vacation rental was enjoyable.`
    })
    await fileDBCreate(db, `${table}:11`, {
      name: {
        first: `Simon`,
        last: `P`
      },
      date: `6/26/2022`,
      image: `https://s3-media0.fl.yelpcdn.com/photo/HFmBijAeemsnHF3XJNF2aw/60s.jpg`,
      city: `Coronado`,
      state: `CA`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Outstanding service from pick up to drop off - Vince was in constant communications with us leading up to our departure day, arrived early and helped Load and unload the bags. Great guy and awesome service.`
    })
    await fileDBCreate(db, `${table}:10`, {
      name: {
        first: `Christian`,
        last: `L`
      },
      date: `3/28/2022`,
      city: `Burlingame`,
      state: `CA`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `We had a top notch experience with Vince.  He drove 6 of us from Phoenix airport to Sedona. His communication prior to the ride was exemplary - great attention to detail.  He was bang on time. Spotless car, excellent, safe driving, and a very pleasant person too.  All round couldn't recommend Vince more highly.`
    })
    await fileDBCreate(db, `${table}:9`, {
      name: {
        first: `Susan`,
        last: `W`
      },
      date: `11/26/2022`,
      image: `https://s3-media0.fl.yelpcdn.com/photo/mIx0gj-FV0R_Bv26MzhRLA/60s.jpg`,
      city: `Manhattan`,
      state: `NY`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `FANTASTIC SERVICE! My first time booking with Vince and I'm very impressed. Needed to be picked up from the PHX airport on Thanksgiving day. My regular drivers weren't available. Vince called me back within 20 minutes of my submitting a request. Brendon, his driver that day, showed up on time even though my flight was early. He was explicit about details regarding where to wait, and how many minutes before his arrival. This is the kind of service you want from a top-tier company. And the price was better than those I'd used in the past. It's a solid win. Thank you Vince and Brendon!!`
    })
    await fileDBCreate(db, `${table}:8`, {
      name: {
        first: `Linda`,
        last: `W`
      },
      date: `10/30/2022`,
      city: `SoMa, San Francisco`,
      state: `CA`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Vince arrived a few minutes early to give my daughter a pleasant ride to the airport.  Very pleased with the service! I look forward to using Vince's service from now on - thanks Vince!`
    })
    await fileDBCreate(db, `${table}:7`, {
      name: {
        first: `Carol`,
        last: `W`
      },
      date: `10/25/2022`,
      city: `Fountain Hills`,
      state: `AZ`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `On time, friendly, nice clean vehicle and a good driver.  We would recommend Vince.`
    })
    await fileDBCreate(db, `${table}:6`, {
      name: {
        first: `Jeannette`,
        last: `M`
      },
      date: `7/1/2022`,
      city: `Goodyear`,
      state: `AZ`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Vince was a stellar professional with attentive on time service. He responsibly  confirmed, and followed up with effective suggestions on travel. I highly recommend his service.`
    })
    await fileDBCreate(db, `${table}:5`, {
      name: {
        first: `Lisa`,
        last: `P`
      },
      date: `6/15/2022`,
      image: `https://s3-media0.fl.yelpcdn.com/photo/o1OG85ptfXVGPkqzUxhs5A/60s.jpg`,
      city: `SoMa, San Francisco`,
      state: `CA`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `I contacted Vince in the afternoon for a ride the next day at 9AM for my elderly father who got stranded in Casa Grande. My dad was picked up early and was treated with so much care after a stressful situation. I highly recommend Vince for any and all trips you may need a car service for. \\nThank you Vince - The Edelstein's`
    })
    await fileDBCreate(db, `${table}:4`, {
      name: {
        first: `John`,
        last: `H`
      },
      date: `4/24/2022`,
      city: `MN`,
      state: `MN`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Setting up our scheduled shuttle ahead of time was very straightforward. When we arrived at Sky Harbor, I received a text from Vince, "I see that your flight arrived early. I will be at our designated pickup location early at......."  We walked our with our luggage and right into our ride to our AZ home in the west valley.  Friendly, efficient and reliable at a very reasonable rate.  We will hope to use Vince's service again and will recommend him to our friends and neighbors as well.`
    })
    await fileDBCreate(db, `${table}:3`, {
      name: {
        first: `Constance`,
        last: `G`
      },
      date: `4/15/2022`,
      city: `NY`,
      state: `NY`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Vince was so accommodating, even though my travel plans changed. Will definitely use VINCE DRIVES YOU next time I am in Phoenix. Will recommend to family and friends !`
    })
    await fileDBCreate(db, `${table}:2`, {
      name: {
        first: `Paul`,
        last: `C`
      },
      date: `4/6/2022`,
      city: `Sun City West`,
      state: `AZ`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `If you could give more than 5 Stars, I would.. Vince drove us from Sun City West to Mesa/Gateway Airport and the ride was Wonderful!.. He was Polite, On Time and a Safety First Driver.. the ride was smooth and worry free.. We Will Definitely call Vince again when we need a Professional/Private Driver. We Highly Recommend "Vince Drives You".`
    })
    await fileDBCreate(db, `${table}:1`, {
      name: {
        first: `Celeste`,
        last: `H`
      },
      date: `3/29/2022`,
      city: `Surprise`,
      state: `AZ`,
      stars: 5,
      usefulCount: 0,
      funnyCount: 0,
      coolCount: 0,
      review: `Our Uber driver cancelled our ride, we found Vince through Yelp and he not only answered our call at 4am but got us to the airport. I would highly recommend Vince's service, he is professional and friendly. Additionally he was very reasonable in price.`
    })
    await fileDBCreate(db, `${table}:20`, {
      replyingTo: 18,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `11/24/2022`,
      title: `Business Owner`,
      reply: `Thanks so much for the compliments, there is one slight correction, I accept all major credit cards, Zelle and cash. PayPal proved to be to much of a problem. \\n\\nHave a great trip and we’ll see you when you get back.`
    })

    await fileDBCreate(db, `${table}:21`, {
      replyingTo: 19,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `12/21/2022`,
      title: `Business Owner`,
      reply: `Thanks Doug, we strive to provide the best service at a reasonable price. I appreciate your business and look forward to working with you again. \\n\\nVince`
    })
    await fileDBCreate(db, `${table}:22`, {
      replyingTo: 17,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `11/20/2022`,
      title: `Business Owner`,
      reply: `Thanks Wayne, I appreciate it.`
    })
    await fileDBCreate(db, `${table}:23`, {
      replyingTo: 15,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `11/1/2022`,
      title: `Business Owner`,
      reply: `Thanks Nancy, you guys were a lot of fun, can't wait till next time.`
    })
    await fileDBCreate(db, `${table}:24`, {
      replyingTo: 14,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `8/19/2022`,
      title: `Business Owner`,
      reply: `Thanks so much for the great review. I was my pleasure working with you and look forward to being able to again.`
    })
    await fileDBCreate(db, `${table}:25`, {
      replyingTo: 10,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `3/28/2022`,
      title: `Business Owner`,
      reply: `Thanks so much for the compliment, it was a pleasure driving you and hope to see you again in the future. Enjoy the Red Rocks.`
    })
    await fileDBCreate(db, `${table}:26`, {
      replyingTo: 9,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `11/26/2022`,
      title: `Business Owner`,
      reply: `Thank you Susan, I strive to give this level of service to everyone that I help. Brenda and I really appreciate your review and look forward to working with you again. \\n\\nVince`
    })
    await fileDBCreate(db, `${table}:27`, {
      replyingTo: 8,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `10/30/2022`,
      title: `Business Owner`,
      reply: `Thanks Linda, I enjoyed meeting you and your daughter. I'll be happy to provide service to you in the future.`
    })
    await fileDBCreate(db, `${table}:28`, {
      replyingTo: 7,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `10/26/2022`,
      title: `Business Owner`,
      reply: `Thanks Carol, I enjoyed the trip with you and your husband and look forward to your upcoming return.`
    })
    await fileDBCreate(db, `${table}:29`, {
      replyingTo: 4,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `4/24/2022`,
      title: `Business Owner`,
      reply: `Thanks, it was a pleasure meeting you and I will be happy to work with you again in the future.`
    })
    await fileDBCreate(db, `${table}:30`, {
      replyingTo: 1,
      image: `https://s3-media0.fl.yelpcdn.com/buphoto/P5CU_mkQeRZtDwo6g9Vpeg/30s.jpg`,
      name: {
        first: `Vincent`,
        last: `S`
      },
      date: `3/30/2022`,
      title: `Business Owner`,
      reply: `Thanks for your compliment, I’m glad I was able to help. It was a pleasure meeting you.`
    })
    await printRecordCountAndData(db, table)
  } catch (e) {
    logError(`Error populating ${table} table.`, e);
  }
}
