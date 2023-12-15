'use strict';
const VeggieBoxStore = require('../utils/veggiebox_store.js');
let Store = new VeggieBoxStore();
const CustomerSession = {};
let itemsPricesArr
const router = require('express').Router();
const WhatsappCloudAPI = require('whatsappcloudapi_wrapper');
const { SessionsClient } = require('dialogflow');
const { JWT } = require('google-auth-library');
const _ = require('lodash');

const projectId = 'veggiebox-agent-pkpa';
const keyFilePath = "././google_jwt/veggiebox-agent-pkpa.json";
const config = {
    credentials: {
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC6QggQsPMQ0Qzx\nu0CVJzYwPtFkrLaQK0MOhkYSuxSt87Z+FgpC3BnR2aV9oSR8PTl9IQ0VI8GkJ3dh\na+p4O0/JkA30Luee2YUMNM/ASgGfpC+X6lhgDa3G8UrQmQ96ohsCE3RtpLwU8NHM\npWs6Pr06TunK/0mMamorqft/6Y9s9kBAW32QKyLORMf225KFuN9CbACTE2zYS0e6\nvrhSe8oA5TzWEdDQ7wtonO6ZQ+GxwcYJ0bRcKqdN6pVBUFoC4XMxdOHRYZkTNKcL\naeIwepN2Lte82IVaB5jgwzy/Ngbu7fd8sSP1DI5NYdhZTEa8SDtvtnTJetX19DvE\nY9czgmPLAgMBAAECggEAAz6JWlmw2FNfjR2/GQFhiXu/3GzAzaDVvnzeaSKmnxmr\nVyqWMLUtXfTYQC18iEiLL855HHqxHgLeSDwiNRcnFKFAzjMeCCvWs5e6XNDtMCjT\n97SFRY5tl9oiQaEj9vWkgY82bEO5FDCbMf6UjbcrRxWmVrXuHH57j96GuHuoYNHG\nih5Mue1A+6VdmpivOritJFZf77F3RdOdIYbXWsYbgvMaXm413T6p70uJf+X8FOLv\n4n7b3BV1+zXhBxX9Yd0tKcDntzvK+Hwkeq8gNaFha+xPr5rvJPg9DSXa2raReGXk\nZsMgxdKrJRXyHZFD4UUUQmBtTMAFrb0NJ1wSwl2fQQKBgQDsI/YH8QsZ+bu3ZtaW\ntLqY21FNePubZ60pSPnz/eBarIyULXNyYqPHz0rNtoL6vTBB1/UaA6lht479bykY\n3ywQcKK7oSgw8EjfK5e49YZSHbAqMpa6SsaIFhXGboUKEzlIZTJEV+p3Bim9uILN\nC2aE4iKicDq1oJiZPze28+/iDwKBgQDJ7Bz9XjuI+TN/QFw1JyE4lPYixH3CjlTd\nZSW5ni5hkWEgYSPSrz7AZkYU79d4dYwrESkDQoq+vld37qovgfHGOBOl80Rd7kOL\nAEWTHiseNPveEVQm/iRSPYlN4+ZsddzfCjbwYA2WTFtWJgg4HzV8BdVPDG4W5jQR\nl2PRqMjuhQKBgCJG4gqrEYp2tqnbkqCToVZY14dgXV1kgj0w659gJbXjwBAuPMjI\nyq9RRrFvobmVxrB4EYryJx8ZDvd4sEV89593ShfkP7pC1sEWSdK+SP4Ycx7c8wYd\nno3Ybta76jHZMoJwtgg3nsAiM+LnKo1q7zmwvYhItCzzH9N22raC2Do/AoGAW33X\nuNn8wdigg9UmspLTU67zQ9eiYAhb3aEaEdvhiiX0S1aYg7sSBN2SfaQbDqK8azsw\nSSDaewkF2vrSNAp+AWGhTX1HigQOqKnr3Hg780jworNZXP2keXsWfqt32cch2BHp\nyMrM/UAF1qgO61cAxfxipZmtPET8bMga24HN4X0CgYAfKlAW1TMA1vwilhqdTucn\ne4aqishznPwVr9yoc+su5aN00dQqdVbUpKLTPNddfxjbJQnFPaphxls2vkYuXLTJ\nROLzgN4i6BQolTx6yvd6+nMIVISysEq35d/i5TGfDAsHulKNpGzYdOOI4XRq3vFn\ntSUUyHxgPX0AXY7GQhkygA==\n-----END PRIVATE KEY-----\n",//process.env.DIALOGFLOW_PRIVATE_KEY,
      client_email: process.env.DIALOGFLOW_CLIENT_EMAIL
    }
  };
// Create a new JWT client using the service account key
// const client = new JWT({
//     keyFile: keyFilePath,
//     scopes: ['https://www.googleapis.com/auth/cloud-platform']
//   })

router.get('/meta_wa_callbackurl', (req, res) => {
    try {
        console.log('GET: Someone is pinging me!');
        let mode = req.query['hub.mode'];
        let token = req.query['hub.verify_token'];
        let challenge = req.query['hub.challenge'];

        if (
            mode &&
            token &&
            mode === 'subscribe' &&
            process.env.Meta_WA_VerifyToken === token
        ) {
            return res.status(200).send(challenge);
        } else {
            return res.sendStatus(403);
        }
    } catch (error) {
        console.error({error})
        return res.sendStatus(500);
    }
});

router.post('/meta_wa_callbackurl', async (req, res) => {
    console.log('POST: Someone is pinging me!');
    try {
        const Whatsapp = new WhatsappCloudAPI({
            accessToken: process.env.Meta_WA_accessToken,
            senderPhoneNumberId: process.env.Meta_WA_SenderPhoneNumberId,
            WABA_ID: process.env.Meta_WA_wabaId, 
            graphAPIVersion: 'v13.0'
        });
        // console.log("||||||Whatsapp.parseMessage||||||||")
        //     console.log(Whatsapp)
        let data = Whatsapp.parseMessage(req.body);
            console.log("||||||Whatsapp.parseMessage||||||||")
            console.log(data)
        if (data?.isMessage) {
            let incomingMessage = data.message;
            let recipientPhone = incomingMessage.from.phone; // extract the phone number of sender
            let recipientName = incomingMessage.from.name;
            let typeOfMsg = incomingMessage.type; // extract the type of message (some are text, others are images, others are responses to buttons etc...)
            let message_id = incomingMessage.message_id; // extract the message id
             // Create a new session ID using the WhatsApp phone number
            const sessionId = recipientPhone.split('@')[0];
            // Create a new Dialogflow session client using the service account key
            const sessionClient = new SessionsClient(config);
            
             // Start of cart logic
             if (Object.keys(CustomerSession).length === 0) {
                console.log("---init CustomerSession---")
                CustomerSession["oderdetails"] = {
                    "recipientPhone": recipientPhone,
                    "cart": [],
                    "location": {}
                  };
            }

            let addToCart = async ({itemsPricesArr}) => {
                CustomerSession["oderdetails"]["cart"] = itemsPricesArr;
            };
            if (typeOfMsg === 'location_message') {
                if (Object.keys(CustomerSession).length === 0){
                    await Whatsapp.sendText({
                        recipientPhone: recipientPhone,
                         message: "I need you location only for delivery, looks like you cart is emplty at the moment"
                        })
                } else {
                    CustomerSession["oderdetails"]["location"] = incomingMessage.location
                    console.log(CustomerSession)
                    let listOrder = await Store.postItemsOrdered(CustomerSession)                    
                    if(listOrder.status === "success") {
                        let serial = 1
                        let totalBill = 0;
                        let invoiceText = `List of items in your cart:\n`;
                        console.log("OOOOOOOOOOOOOO")
                        console.log(listOrder.data)
                        console.log("OOOOOOOOOOOOOO")
                        console.log("9999999999999")
                        console.log(listOrder.data["orderedItemList"])
                        console.log("9999999999999")
                        console.log(typeof listOrder.data["orderedItemList"]);
                        // listOrder.data.forEach((item, index) => {
                        //     let serial = index + 1;
                        //     totalBill += item.price
                        //     invoiceText += `\n#${serial}: ${item.name} @ k${item.price}`;
                        // });
                        // for (let i = 0; i < listOrder.data["orderedItemList"].length; i++) {
                        //     const element = array[i];
                        //     console.log(element)
                        //     let serial = index + 1;
                        //     totalBill += element.itemPrice
                        //     invoiceText += `\n#${serial}: ${element.itemName} @ k${element.itemPrice}`;
                            
                        // }
                        for (let key in listOrder.data["orderedItemList"]) {
                            // Access each property using key
                            let item = listOrder.data["orderedItemList"][key];
                            // Process the item or access its properties
                            console.log(item.itemName);
                            console.log(item.itemPrice);
                            console.log(item.itemPacksQty);
                            totalBill += item.itemPrice
                            invoiceText += `\n#${serial}: ${item.itemPacksQty} ${item.packageType} ${item.itemName} @ k${item.itemPrice}`;
                            serial +=1
                          }
                          
                        invoiceText += `\n\nTotal: k${totalBill}`;
    
                        Store.generatePDFInvoice({
                            order_details: invoiceText,
                            file_path: `./invoice_${recipientPhone}.pdf`,
                        });
    
                        await Whatsapp.sendText({
                            message: invoiceText,
                            recipientPhone: recipientPhone,
                        });
    
                        await Whatsapp.sendSimpleButtons({
                            recipientPhone: recipientPhone,
                            message: `Thank you for shopping with us, ${recipientName}.\n\nYour order has been received & will be processed shortly.`,
                            message_id,
                            listOfButtons: [
                                {
                                    title: 'See more products',
                                    id: 'all_items',
                                },
                                {
                                    title: 'Print my invoice',
                                    id: 'print_invoice',
                                },
                            ],
                        });
                        //clearCart({ recipientPhone });
                    } else{
                        await Whatsapp.sendText({message: listOrder.data, recipientPhone: recipientPhone})
                    }
                }
            }
            if (typeOfMsg === 'text_message') {
                let incomingMessageContent = incomingMessage.text.body;
                console.log("))))))incomingMessage)))))")
                console.log(incomingMessageContent)
                // Send the message to Dialogflow for processing
                const session = sessionClient.sessionPath(projectId, sessionId);
                const dialogflowResponse = await sessionClient.detectIntent({
                session,
                queryInput: {
                    text: {
                    text: incomingMessageContent,
                    languageCode: 'en-US',
                    },
                },
                });
                    // Extract the response from Dialogflow and send it back to WhatsApp
                const { fulfillmentText } = dialogflowResponse[0].queryResult;
                console.log("+++dialogflowResponse++++")
                console.log(dialogflowResponse)
                const { action } = dialogflowResponse[0].queryResult;
                const { parameters } = dialogflowResponse[0].queryResult
                //Actions cases        
                switch (action) {
                    case 'greeting':
                        await Whatsapp.sendSimpleButtons({
                                    message: `Hey ${recipientName}, am AI chatbot and am here to assist you! \nPlease choose from the following:`,
                                    recipientPhone: recipientPhone, 
                                    listOfButtons: [
                                        {
                                            title: 'See all items',
                                            id: 'all_items',
                                        },
                                        {
                                            title: 'Vegetables',
                                            id: 'veg_category',
                                        },
                                        {
                                            title: 'Speak to a human',
                                            id: 'speak_to_human',
                                        },
                                    ],
                                });
                        break;
                    case 'vegsFruits':
                                let arrVegsFruitsName = []
                                let arrVegsFruitsPrice = []
                                let listFruitOrdered = parameters.fields['vegs_fruits'].listValue.values
                                console.log(listFruitOrdered)
                                let listPriceOrdered = parameters.fields['number'].listValue.values
                                listFruitOrdered.map((item) => {                                    
                                    let name = item.stringValue
                                    arrVegsFruitsName.push(name)                 
                                })
                                listPriceOrdered.map((item) => {
                                    let price = item.numberValue
                                    arrVegsFruitsPrice.push(price)
                                })
                                itemsPricesArr = _.zip(arrVegsFruitsName, arrVegsFruitsPrice)
                                console.log("++++listPriceOrdered+++")
                            console.log(itemsPricesArr)
                            //Go Get fruits total price
                            let reply = await Store.getItemsPrice(itemsPricesArr)
                            if (reply.status === "success") {
                                await Whatsapp.sendSimpleButtons({
                                    recipientPhone: recipientPhone,
                                    message: reply.data,
                                    message_id,
                                    listOfButtons: [
                                        {
                                            title: 'Add to cart🛒',
                                            id: `add_to_cart`,
                                        },
                                        {
                                            title: 'See more products',
                                            id: 'all_items',
                                        },                                
                                        {
                                            title: 'Speak to a human',
                                            id: 'speak_to_human',
                                        }
                                    ]
                                })
                            } else {
                                await Whatsapp.sendText({message: reply.data, recipientPhone: recipientPhone})
                            }
                            
                        break
                    default:
                        // const response = {
                        //     message: fulfillmentText,
                        //     recipientPhone: recipientPhone,
                        //     //timestamp: timestamp,
                        //     };
                        //     console.log(fulfillmentText)
                        //     await Whatsapp.sendText(response)
                        break;
                }

            }

            //Get button id
            if (typeOfMsg === 'simple_button_message') {
                let button_id = incomingMessage.button_reply.id;
                let message = `*FRUITS*\n\n`
                switch (button_id) {
                    case 'all_items':
                        let listOfProducts = await Store.getProductsInCategory();
                        listOfProducts.data.map((product) => {
                            let emoji = product.emoji
                            let name = product.name
                            let packPrice = product.pack_price
                            let packedItems = product.packed_items
                            message += `${emoji} *${name} Pack of ${packedItems}  k${packPrice}*\n\n`
                        })
                        message += `\nShare your list of items you want to order.\n_eg. 2 packs banana 5 pack red onion_`
                        const reply = {
                            message: message,
                            recipientPhone: recipientPhone,
                            //timestamp: timestamp,
                            }
                        await Whatsapp.sendText(reply)
                        break;
                    case 'speak_to_human':
                            // respond with a list of human resources
                        await Whatsapp.sendText({
                            recipientPhone: recipientPhone,
                            message: `Not to brag, but unlike humans, chatbots are super fast⚡, we never sleep, never rest, never take lunch🍽 and can multitask.\n\nAnway don't fret, a hoooooman will 📞contact you soon.\n\nWanna call now?\nHere are the contact details:`,
                        });

                        await Whatsapp.sendContact({
                            recipientPhone: recipientPhone,
                            contact_profile: {
                                addresses: [
                                    {
                                        city: 'Lusaka',
                                        country: 'Zambia',
                                    },
                                ],
                                name: {
                                    first_name: 'Kachinga',
                                    last_name: 'Schezongo',
                                },
                                org: {
                                    company: 'VeggieBox',
                                },
                                phones: [
                                    {
                                        phone: '+260 95 5752603',
                                    },
                                    {
                                        phone: '+260 978681630',
                                    },
                                ],
                            },
                        });
                        break
                    case "all_items":
                        await Whatsapp.sendSimpleButtons({
                            message: `Here you go 😊\nPlease choose from the following:`,
                            recipientPhone: recipientPhone, 
                            listOfButtons: [
                                {
                                    title: 'See all items',
                                    id: 'all_items',
                                },
                                {
                                    title: 'Vegetables',
                                    id: 'veg_category',
                                },
                                {
                                    title: 'Speak to a human',
                                    id: 'speak_to_human',
                                },
                            ],
                        });
                        break
                    case "add_to_cart":                       
                        await addToCart({itemsPricesArr})
                        await Whatsapp.sendSimpleButtons({
                            message: `✅ Your cart has been updated.\nWhat do you want to do next?`,
                            recipientPhone: recipientPhone,
                            message_id,
                            listOfButtons: [
                                {
                                    title: 'Checkout 🛍️',
                                    id: `checkout`,
                                },
                                {
                                    title: 'Add more to cart🛒',
                                    id: 'all_items',
                                },
                                {
                                    title: 'Clear cart🛒',
                                    id: 'clear_cart',
                                },
                            ],
                        });
                        break
                    case "checkout":
                        await Whatsapp.sendText({
                            recipientPhone: recipientPhone,
                            message: "Please share your location for delivery 📍"
                        })                                                
                        break
                    case "clear_cart":
                        await Whatsapp.sendSimpleButtons({
                            recipientPhone: recipientPhone,
                            message: "✅ DONE\n",
                            message_id,
                            listOfButtons: [
                                {
                                    title: 'See more products',
                                    id: 'all_items',
                                },                                
                                {
                                    title: 'Speak to a human',
                                    id: 'speak_to_human',
                                }
                            ]
                        })
                        break
                    case "print_invoice":
                        // Send the PDF invoice
                        await Whatsapp.sendDocument({
                            recipientPhone,
                            caption: `VeggieBox Shop invoice #${recipientName}`,
                            file_path: `./invoice_${recipientPhone}.pdf`,
                        });
                        break
                    
                        default:
                        break;
                }
            }

            await Whatsapp.markMessageAsRead({
                message_id,
            });         
        }

        return res.sendStatus(200);
    } catch (error) {
                console.error({error})
        return res.sendStatus(500);
    }
});
module.exports = router;
