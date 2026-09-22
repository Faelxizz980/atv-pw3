import express from 'express';
import * as tarefa from './tarefa.service.js';

const router = express.Router();

router.get('/', async (req, res)=>{
    try {
        const tarefas = await tarefa.getAll();
        res.json(tarefas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar tarefas' });
    }
});
router.get('/:id', async (req, res)=>{
    try {
        const tarefaEncontrada = await tarefa.getById(req.params.id);
        if (!tarefaEncontrada) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        res.json(tarefaEncontrada);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar tarefa' });
    }
});
router.post('/', async (req, res)=>{
    try {
        const id = await tarefa.create(req.body);
        res.status(201).json({ id });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar tarefa' });
    }
});
router.put('/id', async (req, res) =>{
    try{
        const tarefaAtualizada = await tarefa. update(req.params.id, req.body);
        if(!tarefaAtualizada){
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        res.json(tarefaAtualizada);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar tarefa' });
    }
});

router.delete('/id', async (req, res) =>{
    try{
        const tarefaDeletada = await tarefa.delete(req.params.id);
        if(!tarefaDeletada){
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        res.json(tarefaDeletada);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar tarefa' });
    }
})




export default router;