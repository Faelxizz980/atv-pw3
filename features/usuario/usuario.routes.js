import express from 'express';
import * as usuario from './usuario.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const usuarios = await usuario.getAll();
        if(!usuarios){
            return res.status(404).json({error: 'usuarios não encontrados'})
        }
        res.status(200).json({error: 'usuarios encontrados'});
    } catch (error) {
     res.status(500).json({error: 'erro ao buscar os usuarios'})
    }
});

router.get('/:id', async (req, res) => {
    try {
        const usuarioEncontrado = await usuario.getById(req.params.id);

        if (!usuarioEncontrado) {
            return res.status(404).json({
                error: 'Usuário não encontrado'
            });
        }
        return res.status(200).json({message: 'usuario consultado', usuarioEncontrado});
    } catch (error) {

        res.status(500).json({
            error: 'Erro ao buscar usuário',
            detalhes: error.message
        });
    }
});

router.post('/', async (req, res) => {
    try {
        const id = await usuario.create(req.body);

        if (!id) {
            return res.status(409).json({
                error: 'E-mail já cadastrado'
            });
        }

        res.status(201).json({
            mensagem: 'Usuário criado com sucesso',
            id
        });

    } catch (error) {
        console.error('ERRO AO CRIAR USUÁRIO:', error);

        res.status(500).json({
            error: 'Erro ao criar usuário',
            detalhes: error.message
        });
    }
});

router.put('/:id', async (req, res)=>{
    try{
        const userput = await usuario.getById(req.params.id);
        if(!userput){
            return res.status(404).json({error: 'usuário não encontrado'});
        }
        res.status(200).json({error: 'usuario atualizado'});
        const usuarioAtualizado = await usuario.update({id: req.params.id, ...req.body});
        return (usuarioAtualizado)

    } catch (error){
            res.status(500).json({error: 'erro ao atualizar o usuario'});
        }
});

router.delete('/:id', async (req, res)=>{
    const usuarioRemove = await usuario.getById(req.params.id);
    try{
        if(!usuarioRemove){
            return res.status(404).json({error: 'usuario nao encontrado'});
        }
        res.status(200).json({error: 'usuario deletado'});
         const usuarioDeletado = await usuario.remove(req.params.id);
         return(usuarioDeletado)
    }catch(error){
        res.status(500).json({error: 'erro ao deletar'});
    }

});

export default router;