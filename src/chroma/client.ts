import { ChromaClient, Collection } from "chromadb";
import OpenAI from "openai";
import { env } from "../config/env";
import { OpenAIEmbeddingFunction } from "@chroma-core/openai";


const doc1 = `
Title: FIFA World Cup 2026 Host Nations

The FIFA World Cup 2026 will be jointly hosted by the United States, Canada, and Mexico. 
This marks the first time in history that three countries will host the tournament together. 
It will also be the first World Cup hosted by multiple countries since 2002, when Japan and South Korea co-hosted the tournament. 
The 2026 edition returns to North America for the first time since 1994 (USA) and 1986 (Mexico).
`;

const doc2 = `
Title: Expanded 48-Team Format

The 2026 World Cup will feature 48 teams instead of the traditional 32. 
This expansion increases global representation and allows more nations to participate. 
The new format is expected to include 12 groups, with the top teams advancing to a larger knockout stage. 
The total number of matches will increase significantly compared to previous tournaments.
`;

const doc3 = `
Title: Major Stadiums for FIFA 2026

Several major stadiums across North America will host matches in the 2026 World Cup. 
In the United States, stadiums such as MetLife Stadium (New Jersey), SoFi Stadium (Los Angeles), and AT&T Stadium (Dallas) are expected venues. 
In Mexico, Estadio Azteca in Mexico City will host matches, making it the first stadium to host World Cup matches in three different tournaments. 
Canada will host games in cities like Toronto and Vancouver.
`;

const doc4 = `
Title: Economic and Business Impact of FIFA 2026

The 2026 World Cup is expected to generate billions of dollars in economic activity across North America. 
Host cities anticipate increased tourism, hospitality revenue, infrastructure investment, and job creation. 
Major sponsors and broadcasting deals will further drive financial impact. 
The tournament is projected to be one of the most commercially successful sporting events in history.
`;

const doc5 = `
Title: Qualification Process and Global Participation

The expanded 48-team format changes the qualification process across all FIFA confederations. 
More slots will be allocated to regions such as Africa (CAF), Asia (AFC), and CONCACAF. 
This aims to improve global representation and competitive balance. 
The 2026 World Cup is expected to reach a record-breaking global television audience, potentially exceeding 5 billion viewers worldwide.
`;



const openai: OpenAI = new OpenAI({ apiKey: env.openAiApiKey });

const chromaUrl = env.chromaUrl;
const normalizedChromaUrl = chromaUrl.includes("://") ? chromaUrl : `http://${chromaUrl}`;
const { hostname, port, protocol } = new URL(normalizedChromaUrl);

export const client = new ChromaClient({
    host: hostname,
    port: Number(port || (protocol === "https:" ? 443 : 80)),
    ssl: protocol === "https:",
});

const embeddingFunction = new OpenAIEmbeddingFunction({ modelName: "text-embedding-3-small", apiKey: env.openAiApiKey });

async function main() {
    const collection = await client.getOrCreateCollection({ name: "fifa-2026", embeddingFunction });
    // console.log(`Collection ready: ${collection.name}`);
    // await addData([doc1, doc2, doc3, doc4, doc5], collection);
    console.log("Questions ?...");
    process.stdin.addListener("data", async (data) => {

        const question = data.toString().trim();
        if (question.toLowerCase() === "exit") {
            console.log("Exiting...");
            process.exit(0);
        }
        const answer = await queryData(question, collection);
        console.log("Answer:", answer);
        console.log("Questions ?...");
    });
}


async function addData(documents: string[], collection: Collection) {
    const ids = ["id1", "id2", "id3", "id4", "id5"];
    collection.add({
        ids,
        documents
    });
}

async function queryData(query: string, collection: Collection) {
    const results = await collection.query({
        queryTexts: [query],
        nResults: 1,
    });

    const relevantDocument = results.documents[0] ? results.documents[0] : null;
    if (!relevantDocument) {
        return "No relevant information found.";
    }

    const chatAnswer = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: "You are a helpful assistant that answers questions based on the provided document." },
            { role: "user", content: `answer the question based on ${relevantDocument}` }
        ]
    })

    return chatAnswer.choices[0].message.content;

}



// export const createEmbedding = async (inputs: string[]) => {
//     const response = await openai.embeddings.create({
//         model: "text-embedding-3-small",
//         input: inputs
//     })

//     const embeddings = response.data.map((embedding) => embedding.embedding);
//     return embeddings;
// }

main();
