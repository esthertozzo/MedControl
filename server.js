const express = require('express');
const path = require('path');  
const fs = require('fs');   
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 3000;
const methodOverride = require('method-override');
 
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const url = 'mongodb://localhost:27017/';
const dbName = 'Gerenciamento';
const collectionName = 'pacientes';

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/cadastroPaciente', (req,res) => {
    res.sendFile(__dirname + '/cadastroPaciente.html')
});

app.post('/cadastroPaciente', async (req, res) => {
    const novoPaciente = req.body;

    const client = new MongoClient(url);

    try{
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const result = await collection.insertOne(novoPaciente);
        console.log(`Paciente cadastrado com sucesso . ID: ${result.insertedId}`);

        res.redirect('/');
    }catch (err){
        console.error('Erro ao cadastrar o paciente', err);
        res.status(500).send('Erro ao cadastrar o paciente. Por favor, tente novamente mais tarde.')
    }finally{
        client.close();
    }
});

app.get('/pacientes', async (req, res) => {
    const client = new MongoClient(url);

    try{
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const pacientes = await collection.find({},
            {projection: {_id: 1, nome: 1, data_nascimento:1, cpf: 1} }).toArray();

        res.json(pacientes);
    }catch{
        console.error('Erro ao buscar pacientes:', err);
        res.status(500).send('Erro ao buscar pacientes. Por favor, tente novamente mais tarde.');
    }finally{
        client.close();
    }
});


app.get('/paciente/:id', async (req,res) => {
    const {id} = req.params;

    const client = new MongoClient(url);

    try{
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const paciente = await collection.findOne({_id: new ObjectId(id)});

        if(!paciente){
            return res.status(404).send('Paciente não encontrado.');
        }

        res.json(paciente);
    }catch(err){
        console.error('Erro ao buscar o paciente:', err);
        res.status(500).send('Erro ao buscar o paciente. Por favor, tente novamente mais tarde.');
    }finally{
        client.close();
    }
});


//rota para atualizar
app.get('/atualizarPaciente', (req,res) => {
    res.sendFile(__dirname + '/atualizarPaciente.html');
});

app.post('/atualizarPaciente', async (req, res) => {
    const { id, nome, data_nascimento, cpf } = req.body;
    const client = new MongoClient(url);

    try{
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const pacienteAtualizado = await collection.updateOne(
            {_id: new ObjectId(id)},
            {
                $set: {id, nome, data_nascimento, cpf
                }
            }
        );

        if(pacienteAtualizado.modifiedCount > 0 ){
            console.log(`Paciente com ID: ${id} atualizado com sucesso.`);
            res.redirect('/');
        }else{
            res.status(404).send('Paciente não encontrado.');
        }
    }catch (err) {
        console.error('Erro ao atualizar o paciente:', err);
        res.status(500).send('Erro ao atualizar o paciente. Por favor, tente novamente mais tarde.');
    }finally{
        client.close();
    }
});

function criarSaida(paciente){
    return`
    <div class="col">
            <div class="card bg-transparent">
                <div class="card-body">
                    <h5 class="card-title1">${paciente.cpf}</h5>
                    <h5 class="card-title text-uppercase">${paciente.nome}</h5>
                  <hr>
                  <div class="d-flex justify-content-between">
                    <div>
                        <p class="dt_nascimento">${paciente.data_nascimento}</p>
                    </div>
                    <div>
                        <a href="/atualizarPaciente?id=${paciente._id}" class="btn_card btn btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="icon bi bi-arrow-clockwise " viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
                          </svg>
                        </a> 
                        <form action="/deletarPaciente" method="post" onsubmit="return confirm('Tem certeza que deseja excluir o Paciente ${paciente.nome}?');" style="display:inline;">
        <input type="hidden" name="id" value="${paciente._id}">
        <button type="submit" class="btn_card btn btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="icon bi bi-trash-fill" viewBox="0 0 16 16">
                            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                          </svg>
                        </button>
    </form>
                        
                    </div>
                  </div>
                </div>
              </div>
        </div>
    `
}


//erro: não esta buscando o paciente
app.get('/pacientes/buscar', async (req,res) => {
    const nome = req.query.nome;

    const client = new MongoClient(url);

    try{
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const pacienteBuscado = await collection.findOne({nome: nome});

        if(!pacienteBuscado){
            return res.status(404).send('Paciente não encontrado.');
        }

        const pageHtmlPath = path.join(__dirname, '/saidaPaciente.html');
        let pageHtml = fs.readFileSync(pageHtmlPath, 'utf-8');
        const saidaHtml = criarSaida(pacienteBuscado);
        pageHtml = pageHtml.replace('{{saidaPaciente}}', saidaHtml);
        res.send(pageHtml);

    }catch(err){
        console.error('Erro ao buscar o paciente:', err);
        res.status(500).send('Erro ao buscar o paciente. Por favor, tente novamente mais tarde.');
    }finally{
        client.close();
    }
});

app.post('/deletarPaciente', async (req, res) => {
    const {id} = req.body;

    const client = new MongoClient(url);

    try{
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName);

        const result = await collection.deleteOne({_id: new ObjectId(id)});

        if(result.deletedCount > 0){
            console.log(`Paciente com ID: ${id} deletado com sucesso.`);
            res.redirect('/');
        }else{
            res.status(404).send('Paciente não encontrado.');
        }
    }catch(err){
        console.error('Erro ao deletar o paciente:', err);
        res.status(500).send('Erro ao deletar o paciente. Por favor, tente novamente mais tarde.')
    }finally{
        client.close();
    }
});

app.listen(port, () => {
    console.log(`Servidor Node.js em execução em http://localhost:${port}`);
});
