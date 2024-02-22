import { getDocument } from "pdfjs-dist";
import { createReplicateBot, createMessage } from "./bot.mjs";
export async function createResumeBot(_Model, onGenerateCallback = (tokens) => { }) {
    console.log(_Model);
    const Bot = await createReplicateBot(_Model, process.env.REPLICATE_API_TOKEN);
    let OnGenerateCallback = onGenerateCallback;
    let resumeBuffer = "";
    return {
        async LoadResume(buffer) {
            const pdf = await getDocument(buffer);
            await pdf.promise
                .then(async (doc) => {
                const numPages = doc.numPages;
                let lastPromise; // will be used to chain promises
                lastPromise = doc.getMetadata();
                for (let i = 1; i <= numPages; i++) {
                    resumeBuffer += await doc.getPage(i)
                        .then(page => page.getTextContent()
                        .then(content => content.items.map(item => item)))
                        .then(strs => strs.filter(str => str !== undefined).join(" "))
                        .then(str => str);
                }
            });
            this.ResumeBuffer = resumeBuffer;
        },
        set Model(model) {
            _Model = model;
        },
        get Model() {
            return _Model;
        },
        get Callback() {
            return OnGenerateCallback;
        },
        set Callback(callback) {
            OnGenerateCallback = callback;
            Bot.Callback = OnGenerateCallback;
        },
        async Tune(jobDescription) {
            const results = (await Bot.Prompt(`Tune and recreate this resume to match this ${jobDescription}.`)
                .Run());
            console.log(`Prompt count: ${Bot.Messages.length}`);
            Bot.Save("prompts.txt");
            return results;
        },
        async Prompt(prompt) {
            return (await Bot.Prompt(prompt).Run());
        },
        async Initialize() {
            return await Bot.Setup([createMessage("system", "You are a resume analyzer. I will provide you a resume in form of text and then a job description. You must analyze and understand the context of the resume. Compare the resume to the job description and give each part of it a score on how relevant it is for the job. Only generate the info when the resume is provided."),
                createMessage("user", `Heres the resume \n${this.ResumeBuffer}. Dont generate any info yet, wait for the job description.`)]);
        },
        ResumeBuffer: resumeBuffer,
    };
}
