import * as dotenv from 'dotenv';
import express from 'express';
import OpenAI from "openai";
import mongoose from "mongoose";
import { Schema } from "mongoose";

dotenv.config();

const resultSchema = new Schema({
    input: { type: String },
    result: { type: String }
})

const ResultModel = mongoose.model('Result', resultSchema)

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAIKEY
});

// MongoDB connection

const dbURL = process.env.MONGODBLINK

mongoose.connect(dbURL)
.then(res => console.log("DB CONNECTED"))
.catch(err => console.log("DB NOT CONNECTED"))

// ----------------------------

app.post('/ask', async (req, res) => {

    // taking user input request body
    const userInput = req.body.userInput;

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                "role": "system",
                "content": "You are an assistant that would correct any grammatical errors in the provided user input. The output must be in String datatype."
            },
            {
                "role": "user",
                "content": userInput
            }
        ],
        temperature: 1,
        max_tokens: 256,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });

    console.log(response.choices[0].message.content)

    // Saving result in MongoDB
    const resultModel = new ResultModel()
    resultModel.input = userInput;
    resultModel.result = response.choices[0].message.content;
    resultModel.save()

    res.status(200).send({
        "msg": "Data Inserted Successfully"
    })
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});