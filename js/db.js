import { openDB } from "idb";

let db;

async function criarDB(){
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction){
                switch  (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('anotacao', {//tabela
                            keyPath: 'titulo'//id dos itens
                        });
                        store.createIndex('id', 'id');
                        console.log("banco de dados criado!");
                }
            }
        });
        console.log("banco de dados aberto!");
    }catch (e) {
        console.log('Erro ao criar/abrir banco: ' + e.message);
    }
}

window.addEventListener('DOMContentLoaded', async event =>{
    criarDB();
    //document.getElementById('input')
    document.getElementById('btnCadastro').addEventListener('click', adicionarAnotacao);
    document.getElementById('btnCarregar').addEventListener('click', buscarTodasAnotacoes);
    document.getElementById('btnDeletar').addEventListener('click', deletarAnotacao);
    document.getElementById('btnBuscar').addEventListener('click', buscarUmaAnotacao);
});

window.addEventListener(() => {
    document.querySelector('#btnBuscar').addEventListener('submit', async e => {
        e.preventDefault()
        let titulo = document.querySelector('#busca').value
        let result = await getTitulo(titulo)
        if(result){
            document.querySelector('#categoria').innerHTML = result.categoria
            document.querySelector('#descricao').innerHTML = result.descricao
            document.querySelector('#data').innerHTML = result.data
        } else {
            document.querySelector('#categoria').innerHTML = ''
            document.querySelector('#descricao').innerHTML = ''
            document.querySelector('#data').innerHTML = ''
        }
    })
})

async function buscarTodasAnotacoes(){
    if(db == undefined){
        console.log("O banco de dados está fechado.");
    }
    const tx = await db.transaction('anotacao', 'readonly');
    const store = await tx.objectStore('anotacao');
    const anotacoes = await store.getAll();
    if(anotacoes){
        const divLista = anotacoes.map(anotacao => {
            return `<div class="item">
                    <p>Anotação</p>
                    <p>${anotacao.titulo} - ${anotacao.data} </p>
                    <p>${anotacao.categoria}</p>
                    <p>${anotacao.descricao}</p>
                   </div>`;
        });
        listagem(divLista.join(' '));
    }
}

async function getTitulo(){
    return(
        db.transaction(["titulo"], 'readonly').objectStore("titulo").get(titulo)
    )
}

async function buscarUmaAnotacao(){
    if(db == undefined){
        console.log("O banco de dados está fechado.");
    }
    const tx = await db.transaction('anotacao', 'readonly');
    const store = await tx.objectStore('anotacao');
    let buscabarra = document.getElementById("titulo").value;
    const umanota = await store.get(buscabarra);
    if(umanota){
        const divLista = umanota.map(anotacao => {
            return `<div class="item">
                    <p>Anotação</p>
                    <p>${anotacao.titulo} - ${anotacao.data} </p>
                    <p>${anotacao.categoria}</p>
                    <p>${anotacao.descricao}</p>
                   </div>`;
        });
        listagem(divLista.join(' '));
    }
}

async function adicionarAnotacao() {
    let titulo = document.getElementById("titulo").value;
    let categoria = document.getElementById("categoria").value;
    let descricao = document.getElementById("descricao").value;
    let data = document.getElementById("data").value;
    const tx = await db.transaction('anotacao', 'readwrite')
    const store = tx.objectStore('anotacao');
    try {
        await store.add({ 
            titulo: titulo, 
            categoria: categoria, 
            descricao: descricao, 
            data: data });
        await tx.done;
        limparCampos();
        console.log('Registro adicionado com sucesso!');
    } catch (error) {
        console.error('Erro ao adicionar registro:', error);
        tx.abort();

    }
}

async function deletarAnotacao() {
    const tx = await db.transaction('anotacao', 'readwrite')
    const store = tx.objectStore('anotacao');
    const dell = await store.delete();
    if(dell){
        store.delete(anotacao);
        buscarTodasAnotacoes();
    } else {
        console.error("Dados não encontrados no banco!")
    }
}

function limparCampos() {
    document.getElementById("titulo").value = '';
    document.getElementById("categoria").value = '';
    document.getElementById("descricao").value = '';
    document.getElementById("data").value = '';
}

function listagem(text){
    document.getElementById('resultados').innerHTML = text;
}