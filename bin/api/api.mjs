import express from "express";
import cors from "cors";
import multer from "multer";
const app = express();
const upload = multer();
const port = 3000;
let Output = [];
// const LLM = await ResumeBot({Owner: "", Name: ""});
app.use(cors());
app.use(express.json());
app.post("/", upload.array("resume"), async (req, res) => {
    // LLM.Callback = ((tokens) => {
    //     const joined = tokens.join("");
    //     if (Output.indexOf(joined) == -1)
    //             Output.push(joined);
    //     console.log(`\n${joined}\n`);
    //     res.write(Output[Output.length - 1]);
    // });    
    // LLM.LoadResume(((UnsafeCast<File[]>(req.files))[0]).buffer.buffer).then(result => {
    //     console.log("RESUME LOADED");
    //     console.log(Output);
    //     LLM.Initialize(null).then(result => {
    //         console.log("LLM INITIALIZED");
    //         console.log(Output);
    //         LLM.Tune(req.body.job_description).then(result => {
    //             console.log("LLM TUNED.");
    //             console.log(Output);
    //         });;
    //     });
    // });
    res.end();
});
app.get("/output/", (req, res, id) => {
    res.send(Output[Output.length - 1]);
});
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
