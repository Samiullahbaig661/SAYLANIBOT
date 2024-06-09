const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  const dialogflow = require("@google-cloud/dialogflow");
  const { WebhookClient, Payload } = require("dialogflow-fulfillment");
  const express = require("express");
  const nodemailer = require("nodemailer");
  const MODEL_NAME = "gemini-1.5-pro";
  const API_KEY = "AIzaSyDvVpxDIGx-ukiVJB7s5bRq5b_B_lYCUqo";
  
  async function runChat(queryText) {
    const genAI = new GoogleGenerativeAI(
      "AIzaSyDvVpxDIGx-ukiVJB7s5bRq5b_B_lYCUqo"
    );
    console.log(genAI);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
    const generationConfig = { 
      temperature: 1,
      top_p: 0.95,
      top_k: 64,
      max_output_tokens: 60,
      response_mime_type: "text/plain",
    };
  
    const chat = model.startChat({
      generationConfig,
      history: [],
    });
  
    const result = await chat.sendMessage(queryText);
    const response = result.response;
    return response.text();
  }
  
  const webApp = express();
  const PORT = process.env.PORT || 5090;
  webApp.use(
    express.urlencoded({
      extended: true,
    })
  );
  webApp.use(express.json());
  webApp.use((req, res, next) => {
    console.log(`Path ${req.path} with Method ${req.method}`);
    next();
  });
  
  // webApp.get;
  
  webApp.get("/", (req, res) => {
    res.sendStatus(200);
    res.send("Status Okay");
  });
  
  webApp.post("/dialogflow", async (req, res) => {
    var id = res.req.body.session.substr(43);
    console.log(id);
    const agent = new WebhookClient({
      request: req,
      response: res,
    });
  
    function hi(agent) {
      console.log(`intent  => hi `);
      agent.add(
        "Saylani Welfare International Trust has been working for the last 22 years to improve the conditions of the less privileged, helpless, and handicapped individuals. The organization is working day and night to make life happier, especially for the middle class, lower middle class and even lower class."
      );
    }
  
    function Studentdata(agent) {
      const { person,geocity, email,number, cardinal,date, address } =agent.parameters;
      console.log(`intent  =>Studentdata`);
  
      
  
      agent.add("We have received all your details, please check your email");
  
  
      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "samiullahbaig661@gmail.com",
          pass: "przzhqwpjxtqdiwb",
        },
      });
  
      
      var mailOptions = {
        from: "samiullahbaig661@gmail.com",
        to: email,
        subject: "Thank you for your registration at SMIT",
        html: `
            <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #ffffff;
                            border-radius: 10px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                        }
                        .header h1 {
                            color: #007bff;
                        }
                        .content {
                            padding: 20px;
                            background-color: #f9f9f9;
                            border-radius: 8px;
                        }
                        .highlight {
                            color: #007bff;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Thank you for your registration at SMIT</h1>
                        </div>
                        <div class="content">
                            <p>Hello Dear <span class="highlight">${person}</span>!</p>
                            <p>We have received your details:</p>
                            <ul>
                                <li>City: <span class="highlight">${geocity}</span></li>
                                <li>Date of Birth: <span class="highlight">${date}</span></li>
                                <li>CNIC No.: <span class="highlight">${cardinal}</span></li>
                                <li>Email: <span class="highlight">${email}</span></li>
                                <li>Contact Number: <span class="highlight">${number}</span></li>
                                <li>Address: <span class="highlight">${address}</span></li>
                            </ul>
                            <p>Thank you for your registration at SMIT.</p>
                        </div>
                    </div>
                </body>
            </html>
        `
    };
      
  
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    }
  
    async function fallback() {
      let action = req.body.queryResult.action;
      let queryText = req.body.queryResult.queryText;
  
      if (action === "input.unknown") {
        let result = await runChat(queryText);
        agent.add(result);
        console.log(result);
      } else {
        agent.add(result);
        console.log(result);
      }
    }
  
    let intentMap = new Map();
    intentMap.set("hi",hi);
    intentMap.set("Studentdata",Studentdata);
    intentMap.set("fallback", fallback);
    agent.handleRequest(intentMap);
  });
  
  webApp.listen(PORT, () => {
    console.log(`Server is up and running at http://localhost:${PORT}/`);
  });