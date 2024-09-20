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
const collectionName1 = 'medicamentos';
const collectionName2 = 'vendas';

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/infoPacientes', (req, res) => {
    res.sendFile(__dirname + '/infoPacientes.html');
});

app.get('/infoMedicamentos', (req, res) => {
    res.sendFile(__dirname + '/infoMedicamentos.html');
});

app.get('/infoVendas', (req, res) => {
    res.sendFile(__dirname + '/infoVendas.html');
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
app.get('/buscarPaciente', async (req,res) => {
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



app.get('/cadastroMedicamento', (req,res) => {
    res.sendFile(__dirname + '/cadastroMedicamento.html')
});

app.post('/cadastroMedicamento', async (req, res) => {
    const novoMedicamento = req.body;

    const client = new MongoClient(url);

    try{
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName1);

        const result = await collection.insertOne(novoMedicamento);
        console.log(`Medicamento cadastrado com sucesso . ID: ${result.insertedId}`);

        res.redirect('/');
    }catch (err){
        console.error('Erro ao cadastrar o medicamento', err);
        res.status(500).send('Erro ao cadastrar o medicamento. Por favor, tente novamente mais tarde.')
    }finally{
        client.close();
    }
});

app.get('/medicamentos', async (req, res) => {
    const client = new MongoClient(url);

    try{
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName1);

        const medicamentos = await collection.find({},
            {projection: {_id: 1, nome: 1, codigo_registro:1, dosagem: 1} }).toArray();

        res.json(medicamentos);
    }catch{
        console.error('Erro ao buscar medicemntos:', err);
        res.status(500).send('Erro ao buscar medicamentos. Por favor, tente novamente mais tarde.');
    }finally{
        client.close();
    }
});


app.get('/medicamento/:id', async (req,res) => {
    const {id} = req.params;

    const client = new MongoClient(url);

    try{
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName1);

        const medicamento = await collection.findOne({_id: new ObjectId(id)});

        if(!medicamento){
            return res.status(404).send('Medicamento não encontrado.');
        }

        res.json(medicamento);
    }catch(err){
        console.error('Erro ao buscar o medicamento:', err);
        res.status(500).send('Erro ao buscar o medicamento. Por favor, tente novamente mais tarde.');
    }finally{
        client.close();
    }
});


//rota para atualizar
app.get('/atualizarMedicamento', (req,res) => {
    res.sendFile(__dirname + '/atualizarMedicamento.html');
});

app.post('/atualizarMedicamento', async (req, res) => {
    const { id, nome, codigo_registro, dosagem } = req.body;
    const client = new MongoClient(url);

    try{
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName1);

        const medicamentoAtualizado = await collection.updateOne(
            {_id: new ObjectId(id)},
            {
                $set: {id, nome, codigo_registro, dosagem
                }
            }
        );

        if(medicamentoAtualizado.modifiedCount > 0 ){
            console.log(`Medicamento com ID: ${id} atualizado com sucesso.`);
            res.redirect('/');
        }else{
            res.status(404).send('Medicamento não encontrado.');
        }
    }catch (err) {
        console.error('Erro ao atualizar o medicamento:', err);
        res.status(500).send('Erro ao atualizar o medicamento. Por favor, tente novamente mais tarde.');
    }finally{
        client.close();
    }
});

function criarSaidaM(medicamento){
    return`
    <div class="col">
            <div class="card bg-transparent">
                <div class="card-body">
                    <h5 class="card-title1">${medicamento.codigo_registro}</h5>
                    <h5 class="card-title text-uppercase">${medicamento.nome}</h5>
                  <hr>
                  <div class="d-flex justify-content-between">
                    <div>
                        <p class="dt_nascimento">${medicamento.dosagem} mg</p>
                    </div>
                    <div>
                        <a href="/atualizarPaciente?id=${medicamento._id}" class="btn_card btn btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="icon bi bi-arrow-clockwise " viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
                          </svg>
                        </a> 
                        <form action="/deletarPaciente" method="post" onsubmit="return confirm('Tem certeza que deseja excluir o Paciente ${medicamento.nome}?');" style="display:inline;">
        <input type="hidden" name="id" value="${medicamento._id}">
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
app.get('/buscarMedicamento', async (req,res) => {
    const nome = req.query.nome;

    const client = new MongoClient(url);

    try{
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName1);

        const medicamentoBuscado = await collection.findOne({nome: nome});

        if(!medicamentoBuscado){
            return res.status(404).send('Medicamento nao encontrado.');
        }

        const pageHtmlPath = path.join(__dirname, '/saidaMedicamento.html');
        let pageHtml = fs.readFileSync(pageHtmlPath, 'utf-8');
        const saidaHtml = criarSaidaM(medicamentoBuscado);
        pageHtml = pageHtml.replace('{{saidaMedicamento}}', saidaHtml);
        res.send(pageHtml);

    }catch(err){
        console.error('Erro ao buscar o medicamento:', err);
        res.status(500).send('Erro ao buscar o medicamento. Por favor, tente novamente mais tarde.');
    }finally{
        client.close();
    }
});

app.post('/deletarMedicamento', async (req, res) => {
    const {id} = req.body;

    const client = new MongoClient(url);

    try{
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection(collectionName1);

        const result = await collection.deleteOne({_id: new ObjectId(id)});

        if(result.deletedCount > 0){
            console.log(`Medicamento com ID: ${id} deletado com sucesso.`);
            res.redirect('/');
        }else{
            res.status(404).send('Medicamento não encontrado.');
        }
    }catch(err){
        console.error('Erro ao deletar o medicamento:', err);
        res.status(500).send('Erro ao deletar o medicamento. Por favor, tente novamente mais tarde.')
    }finally{
        client.close();
    }
});



app.get('/cadastroVenda', async (req,res) => {
    res.sendFile(__dirname + '/cadastroVenda.html')
});

app.get('/cadastroVenda', async (req, res) => {
    const client = new MongoClient(url);
 
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection2 = db.collection(collectionName2);
        const vendas = await collection2.find({}).toArray();
 
        res.status(200).json(vendas);
 
    } catch (err) {
        console.error('Erro ao achar as vendas:', err);
        res.status(500).send('Erro ao achar as vendas. Por favor, tente novamente mais tarde');
    } finally {
        await client.close();
    }
});

app.post('/cadastroVenda', async (req, res) => {
    const {dataVenda, nomePaciente, cpfPaciente, codigo_registro_med, nomeMed, qtd} = req.body;      
        const client = new MongoClient(url);
       
        try {
            await client.connect();
            const db = client.db(dbName);        
            const collection = db.collection(collectionName);
            const paciente = await collection.findOne({ cpf: cpfPaciente });        
        if (!paciente) {
            return res.status(404).send('Este paciente não está cadastrado.');
        };        
       
        const collection1 = db.collection(collectionName1);        
        const medicamento = await collection1.findOne({ codigo_registro : codigo_registro_med });
 
        if (!medicamento) {            
            return res.status(404).send('Este medicamento não está cadastrado.');
        };
 
        const venda = {dataVenda, nomePaciente, cpfPaciente, codigo_registro_med, nomeMed, qtd};        
        const collection2 = db.collection(collectionName2);        
        const result = await collection2.insertOne(venda);
 
            console.log(`Venda cadastrada com sucesso. ID: ${result.insertedId}`);    
            res.redirect('/');
         }catch (err){
            console.error('Erro ao cadastrar a venda:', err);
            res.status(500).send('Erro ao cadastrar a venda. Por favor, tente novamente mais tarde');
         }finally {
            client.close();  
        }
});

app.get('/vendas', async (req, res) => {
    const client = new MongoClient(url);

    try{
        await client.connect();
        const db = client.db(dbName);
        const collection2 = db.collection(collectionName2);

        const vendas = await collection2.find({},
            {projection: {_id: 1, dataVenda: 1, nomePaciente: 1, cpfPaciente: 1, codigo_registro_med: 1, nomeMed: 1, qtd: 1} }).toArray();

        res.json(vendas);
    }catch{
        console.error('Erro ao buscar vendas:', err);
        res.status(500).send('Erro ao buscar vendas. Por favor, tente novamente mais tarde.');
    }finally{
        client.close();
    }
});


app.get('/venda/:id', async (req,res) => {
    const {id} = req.params;

    const client = new MongoClient(url);

    try{
        await client.connect();
        const db = client.db(dbName);
        const collection2 = db.collection(collectionName2);

        const venda = await collection2.findOne({_id: new ObjectId(id)});

        if(!venda){
            return res.status(404).send('Venda não encontrada.');
        }

        res.json(venda);
    }catch(err){
        console.error('Erro ao buscar a venda:', err);
        res.status(500).send('Erro ao buscar a venda. Por favor, tente novamente mais tarde.');
    }finally{
        client.close();
    }
});


//rota para atualizar
app.get('/atualizarVenda', (req,res) => {
    res.sendFile(__dirname + '/atualizarVenda.html');
});

app.post('/atualizarVenda', async (req, res) => {
    const { id, dataVenda, nomePaciente, cpfPaciente, codigo_registro_med, nomeMed, qtd } = req.body;
    const client = new MongoClient(url);

    try{
        await client.connect();

        const db = client.db(dbName);
        const collection2 = db.collection(collectionName2);

        const vendaAtualizada = await collection2.updateOne(
            {_id: new ObjectId(id)},
            {
                $set: {id, dataVenda, nomePaciente, cpfPaciente, codigo_registro_med, nomeMed, qtd
                }
            }
        );

        if(vendaAtualizada.modifiedCount > 0 ){
            console.log(`Venda com ID: ${id} atualizada com sucesso.`);
            res.redirect('/');
        }else{
            res.status(404).send('Venda não encontrada.');
        }
    }catch (err) {
        console.error('Erro ao atualizar a venda:', err);
        res.status(500).send('Erro ao atualizar a venda. Por favor, tente novamente mais tarde.');
    }finally{
        client.close();
    }
});

function criarSaidaV(venda){
    return`
    <div class="col">
            <div class="card bg-transparent">
                <div class="card-body">
                <div class="d-flex justify-content-between">
                    <h5 class="card-title1">${venda.cpfPaciente}</h5>
                    <h5 class="card-title1">${venda.qtd}</h5>
                </div>
                    <h5 class="card-title text-uppercase">${venda.nomeMed}</h5>
                  <hr>
                  <div class="d-flex justify-content-between">
                    <div>
                        <p class="dt_nascimento">${venda.dataVenda}</p>
                    </div>
                    <div>
                        <a href="/atualizarVenda?id=${venda._id}" class="btn_card btn btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" class="icon bi bi-arrow-clockwise " viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                            <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
                          </svg>
                        </a> 
                        <form action="/deletarVenda" method="post" onsubmit="return confirm('Tem certeza que deseja excluir essa Venda?');" style="display:inline;">
        <input type="hidden" name="id" value="${venda._id}">
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

app.get('/buscarVenda', async (req,res) => {
    const cpfPaciente = req.query.cpfPaciente;

    const client = new MongoClient(url);

    try{
        await client.connect();
        const db = client.db(dbName);
        const collection2 = db.collection(collectionName2);

        const vendasBuscadas = await collection2.find({ cpfPaciente: cpfPaciente }).toArray();

        if(!vendasBuscadas){
            return res.status(404).send('Venda não encontrada.');
        }

        const pageHtmlPath = path.join(__dirname, '/saidaVenda.html');
        let pageHtml = fs.readFileSync(pageHtmlPath, 'utf-8');
        const saidaHtml = vendasBuscadas.map(criarSaidaV).join('');
        pageHtml = pageHtml.replace('{{saidaVenda}}', saidaHtml);
        res.send(pageHtml);

    }catch(err){
        console.error('Erro ao buscar a venda:', err);
        res.status(500).send('Erro ao buscar a venda. Por favor, tente novamente mais tarde.');
    }finally{
        client.close();
    }
});


app.post('/deletarVenda', async (req, res) => {
    const {id} = req.body;

    const client = new MongoClient(url);

    try{
        await client.connect();

        const db = client.db(dbName);
        const collection2 = db.collection(collectionName2);

        const result = await collection2.deleteOne({_id: new ObjectId(id)});

        if(result.deletedCount > 0){
            console.log(`Venda com ID: ${id} deletada com sucesso.`);
            res.redirect('/');
        }else{
            res.status(404).send('Venda não encontrada.');
        }
    }catch(err){
        console.error('Erro ao deletar a venda:', err);
        res.status(500).send('Erro ao deletar a venda. Por favor, tente novamente mais tarde.')
    }finally{
        client.close();
    }
});

app.listen(port, () => {
    console.log(`Servidor Node.js em execução em http://localhost:${port}`);
});
