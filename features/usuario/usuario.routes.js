import express from 'express';
import * as usuario from './usuario.service.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const usuarios = await usuario.getAll();

        return res.status(200).json({
            message: 'Usuários encontrados',
            usuarios
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Erro ao buscar os usuários',
            detalhes: error.message
        });
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

        return res.status(200).json({
            message: 'Usuário consultado',
            usuario: usuarioEncontrado
        });

    } catch (error) {
        return res.status(500).json({
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

        return res.status(201).json({
            message: 'Usuário criado com sucesso',
            id
        });

    } catch (error) {
        console.error('ERRO AO CRIAR USUÁRIO:', error);

        return res.status(500).json({
            error: 'Erro ao criar usuário',
            detalhes: error.message
        });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const userput = await usuario.getById(req.params.id);

        if (!userput) {
            return res.status(404).json({
                error: 'Usuário não encontrado'
            });
        }

        const usuarioAtualizado = await usuario.update({
            id: req.params.id,
            ...req.body
        });

        if (!usuarioAtualizado) {
            return res.status(400).json({
                error: 'Não foi possível atualizar o usuário'
            });
        }

        return res.status(200).json({
            message: 'Usuário atualizado com sucesso'
        });

    } catch (error) {
        console.error('ERRO AO ATUALIZAR USUÁRIO:', error);

        return res.status(500).json({
            error: 'Erro ao atualizar o usuário',
            detalhes: error.message
        });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const usuarioRemove = await usuario.getById(req.params.id);

        if (!usuarioRemove) {
            return res.status(404).json({
                error: 'Usuário não encontrado'
            });
        }

        const usuarioDeletado = await usuario.remove(req.params.id);

        if (!usuarioDeletado) {
            return res.status(400).json({
                error: 'Não foi possível deletar o usuário'
            });
        }

        return res.status(200).json({
            message: 'Usuário deletado com sucesso'
        });

    } catch (error) {
        return res.status(500).json({
            error: 'Erro ao deletar usuário',
            detalhes: error.message
        });
    }
});


export default router;