const express = require('express');
const app = express();
const cors = require('cors');
const { default: ollama } = require('ollama');

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

let messageCache = [];

app.get('/message', async (req,res) => {
    
    res.header('Access-Control-Allow-Origin', 'https://ohhi919.site');
    res.header('Access-Control-Allow-Credentials', true);
    let msg = req.query.msg;
    if(msg.length > 0){
        if(msg == '/clear'){
            clearSession();
            res.send({
                isError: false,
                message: "Session cleared"
            })
            return;
        }
        console.log('generating response for ' + msg);
        messageCache.push({ role: 'user', content: msg });
        const response = await ollama.chat({
            model: 'llama3.2',
            messages: messageCache,
            stream: true
        })
        
        let finalResponse = '';
        process.stdout.write("Response : ");
        for await (const part of response) {
            finalResponse += part.message.content;
            process.stdout.write(part.message.content);
        }
        if(finalResponse.includes('<noReact>')){
            console.log('\nDecided not to response');
            res.send({
                isError: false,
                isNoReaction: true,
                message: undefined
            })
        }else{
            console.log("\nGenerated response for " + msg + ": " + finalResponse);
            res.send({
                isError: false,
                isNoReaction: false,
                message: finalResponse
            });
            messageCache.push({ role: 'assistant', content: finalResponse });
        }
    }else{
        res.send({
            isError: true,
            errorReason: "no message"
        });
    }
})

app.get('/clear', (req, res) => {
    clearSession();
    res.send(200);
})

function clearSession(){
    messageCache = [];
}

app.listen(80, async () => {
    console.log(`Example app listening on port 80`)
})