import { writeFile } from "fs";
import fetch from "node-fetch";
import EventSource from "eventsource";
function createMessage(role, content) {
    return {
        Role: role,
        Content: content,
        toString: () => (role == "user") ? `[INST] ${content} [/INST]` : content
    };
}
export function createReplicateBot(Version, Model, ApiKey, EndToken = "RREND", onGenerateCallback = (tokens) => { }) {
    const MessageQueue = [];
    const Messages = [];
    const Results = [];
    let PromptString = "";
    let OnGenerateCallback;
    let JobManager;
    let StreamEventSource = null;
    return {
        Version,
        Model,
        ApiKey,
        PromptString,
        MessageQueue,
        Messages,
        Results,
        EndToken,
        Result: () => Results.map(result => result.substring(0, result.search(EndToken))),
        async StreamResult(url) {
            StreamEventSource = new EventSource(url);
        },
        async PollResult(url, maxTokens = 1000) {
            let output = null;
            while (output == null) {
                let response = await ((await fetch(url, {
                    method: "GET",
                    headers: { Authorization: `Token ${ApiKey}` }
                })).json());
                if (response.output !== undefined) {
                    let outputSpread = [...response.output];
                    for (let x = 0; outputSpread.join("").search(EndToken) == -1; x++) {
                        output = outputSpread;
                        response = await ((await fetch(url, {
                            method: "GET",
                            headers: { Authorization: `Token ${ApiKey}` }
                        })).json());
                        if (response.output === undefined)
                            break;
                        outputSpread = [...response.output];
                        OnGenerateCallback(outputSpread);
                    }
                }
            }
            return output;
        },
        async Run(model = Model, stream = false) {
            try {
                while (MessageQueue.length > 0) {
                    const message = MessageQueue.shift();
                    PromptString += `${message.toString().trim()}\n`;
                    let response = (await (await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
                        method: "POST",
                        headers: { Authorization: `Token ${ApiKey}` },
                        body: JSON.stringify({
                            version: Version,
                            input: {
                                prompt: PromptString
                            },
                            stream: stream
                        }),
                    })).json());
                    if (message.Role != "system") {
                        Results.push((await this.PollResult(response.urls.get))
                            .filter(token => token !== undefined)
                            .map(token => token.toString())
                            .join(""));
                        PromptString += `${Results[Results.length - 1].trim()}\n`;
                    }
                }
            }
            catch (e) {
                console.error(e);
            }
            return this;
        },
        Prompt(message, role = "user") {
            let messageObj;
            MessageQueue.push(messageObj = createMessage(role, message));
            return this;
        },
        Save(path) {
            writeFile(path, this.PromptString, err => console.log(err));
        },
        get Callback() {
            return OnGenerateCallback;
        },
        set Callback(callback) {
            OnGenerateCallback = callback;
        }
    };
}