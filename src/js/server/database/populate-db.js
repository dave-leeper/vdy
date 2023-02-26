// ONLY USED TO SET UP A FRESH DATABASE.
// surreal start --log debug --user root --pass root memory
// fly apps restart vdydb
module.exports = {
  populateDatabase: async function() {
    const Surreal = require(`surrealdb.js`)
    const {surrealDBSignIn, surrealDBUse, surrealDBCreate, surrealDBChange, surrealDBSelect, surrealDBQuery, surrealDBDelete} = require(`./surrealdb`)
    const Registry = require(`../utility/registry`)

    let db = Registry.get(`SurrealDBConnection`)
    
    if (!db) {
      console.error(`No SurrealDB connection found in register.`)
      return
    }

    try {
      await surrealDBDelete(db, `text`)
      await surrealDBCreate(db, `text:0`, {
        for: `about`,
        text: `Vince Drives You is a Luxury SUV Transportation Service serving the Valley of the Sun. Advance reservations are required. I have an on-time pickup guarantee which means if you're not picked up on time you get a $50 discount on that trip, not a future credit. You can't do better anywhere.
        \n\nIf you are looking for a spacious, clean and comfortable trip then calling me is the only number you need to know. Rates start at $60 and hourly packages are available for your special events. There is never a surge charge, you will know your full fee when your trip is confirmed regardless of how far in advance your service is booked. I now have a Mercedes Sprinter with an 11 passenger capacity also available for larger party pick ups at the airport or for special events.`,
      })
      await surrealDBCreate(db, `text:1`, {
        for: `reviews`,
        text: `These are all genuine reviews from real customers. I can't add to them or edit them. I can only edit my replies, because occasionally I make a mistake.\n\nWe very much enjoy the feedback our customers give us. If you ride with us, feel free to let us know how we did.\n\nVince`,
      })

      await surrealDBDelete(db, `user`)
      await surrealDBCreate(db, `user:0`, {
        userName: `Admin`,
        name: {
          first: `Admin`,
          last: `Admin`
        },
        title: `Admin`,
        password: `Admin`,
        roles: [`Admin`],
      })
      await surrealDBCreate(db, `user:1`, {
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

      await surrealDBDelete(db, `photo`)
      await surrealDBCreate(db, `photo:8`, { text: `Alcantara Vineyards and Winery.`, file: `photo8.jpg` })
      await surrealDBCreate(db, `photo:7`, { text: `Girls just want to have fun and Vince Drives You helps to make that possible.`, file: `photo7.jpg` })
      await surrealDBCreate(db, `photo:6`, { text: `Feel like a trip to Carlsbad, Ca. Vince Drives You can get you there.`, file: `photo6.jpg` })
      await surrealDBCreate(db, `photo:5`, { text: `Five lovely ladies from France with me on a 3-day tour through Arizona, Utah and Nevada.`, file: `photo5.jpg` })
      await surrealDBCreate(db, `photo:4`, { text: `A new member to the service.`, file: `photo4.jpg` })
      await surrealDBCreate(db, `photo:3`, { text: `More time in the red rocks.`, file: `photo3.jpg` })
      await surrealDBCreate(db, `photo:2`, { text: `Ready for adventure.`, file: `photo2.jpg` })
      await surrealDBCreate(db, `photo:1`, { text: `Presidential Service.`, file: `photo1.jpg` })
      await surrealDBCreate(db, `photo:0`, { text: `Enjoy a stress free trip to the red rocks of Sedona.`, file: `photo0.jpg` })

      await surrealDBDelete(db, `news`)
      await surrealDBCreate(db, `news:0`, { title: `Visiting the red rocks of Sedona.`, text: `Phoenix Sky Harbor to Sedona, up to 7 passengers plus luggage for only $240 one way. Call Vince at (602) 545-8557 to schedule your trip.`, file: `news0.jpg` })
      await surrealDBCreate(db, `news:1`, { title: `On time pickup guaranteed.`, text: `Nobody has a better on time record. Period.`, file: `news1.jpg` })
      await surrealDBCreate(db, `news:2`, { title: `We specialize in luxury SUV service.`, text: `Give us a call at (602) 545-8557 to book an appointment. We're always happy to chat about options and pricing.`, file: `news2.jpg` })
      await surrealDBCreate(db, `news:3`, { title: `Pick up that phone.`, text: `Calling me at (602) 545-8557 is the first and best step to having your transportation needs professionally taken care of.`, file: `news3.jpg` })
      await surrealDBCreate(db, `news:4`, { title: `Want a white shirt and tie, then I'm not your guy!`, text: `However, if you are looking for a relaxed, comfortable, 5-star ride with a professional driver then give me a call me at (602) 545-8557 and I can handle all your transportation needs.`, file: `news4.jpg` })
      await surrealDBCreate(db, `news:5`, { title: `Looking for some cool ocean breezes?`, text: `How does a trip to the coast in Carlsbad, CA sound? Yes, we do that also. Call Vince for more information. Call (602) 545-8557.`, file: `news5.jpg` })
      await surrealDBCreate(db, `news:6`, { title: `Coming soon, book now.`, text: `New Mercedes Sprinter 11 passenger van arriving any day now. It’s time to book your special event. Call (602) 545-8557`, file: `news6.jpg` })

      await surrealDBDelete(db, `review`)
      await surrealDBCreate(db, `review:38`, {
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
      await surrealDBCreate(db, `review:37`, {
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
      await surrealDBCreate(db, `review:36`, {
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
      await surrealDBCreate(db, `review:35`, {
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
      await surrealDBCreate(db, `review:34`, {
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
      await surrealDBCreate(db, `review:33`, {
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
      await surrealDBCreate(db, `review:32`, {
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
      await surrealDBCreate(db, `review:31`, {
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
      await surrealDBCreate(db, `review:19`, {
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
      await surrealDBCreate(db, `review:18`, {
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
      await surrealDBCreate(db, `review:17`, {
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
      await surrealDBCreate(db, `review:16`, {
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
      await surrealDBCreate(db, `review:15`, {
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
      await surrealDBCreate(db, `review:14`, {
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
      await surrealDBCreate(db, `review:13`, {
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
      await surrealDBCreate(db, `review:12`, {
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
      await surrealDBCreate(db, `review:11`, {
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
      await surrealDBCreate(db, `review:10`, {
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
      await surrealDBCreate(db, `review:9`, {
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
      await surrealDBCreate(db, `review:8`, {
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
      await surrealDBCreate(db, `review:7`, {
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
      await surrealDBCreate(db, `review:6`, {
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
      await surrealDBCreate(db, `review:5`, {
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
      await surrealDBCreate(db, `review:4`, {
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
      await surrealDBCreate(db, `review:3`, {
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
      await surrealDBCreate(db, `review:2`, {
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
      await surrealDBCreate(db, `review:1`, {
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
      await surrealDBCreate(db, `review:20`, {
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

      await surrealDBCreate(db, `review:21`, {
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
      await surrealDBCreate(db, `review:22`, {
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
      await surrealDBCreate(db, `review:23`, {
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
      await surrealDBCreate(db, `review:24`, {
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
      await surrealDBCreate(db, `review:25`, {
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
      await surrealDBCreate(db, `review:26`, {
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
      await surrealDBCreate(db, `review:27`, {
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
      await surrealDBCreate(db, `review:28`, {
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
      await surrealDBCreate(db, `review:29`, {
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
      await surrealDBCreate(db, `review:30`, {
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

      const text = await surrealDBSelect(db, `text`)
      console.log(text.length)
      console.log(JSON.stringify(text))
      const photos = await surrealDBSelect(db, `photo`)
      console.log(photos.length)
      console.log(JSON.stringify(photos))
      const news = await surrealDBSelect(db, `news`)
      console.log(news.length)
      console.log(JSON.stringify(news))
      const users = await surrealDBSelect(db, `user`)
      console.log(users.length)
      console.log(JSON.stringify(users))
      const reviews = await surrealDBSelect(db, `review`)
      console.log(reviews.length)
      console.log(JSON.stringify(reviews))
      let countResult = await surrealDBQuery(db, `SELECT * FROM type::table($tb)`, {tb: `review`, })
      console.log(countResult[0].result.length)

    } catch (e) {
        console.error(`ERROR POPULATING DATABASE.`, e);
    }
  }
}
