import express from 'express';
import * as usuario from './usuario.service.js';
import { exigirAutenticacao } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import {
    criarUsuarioSchema,
    loginSchema,
    atualizarUsuarioSchema,
    idParamsSchema
} from './usuario.schemas.js';
import { HttpError } from '../../utils/http-error.js';
import { criarToken } from '../../utils/token.js';

const router = express.Router();

// Público: cadastro
router.post('/', validate(criarUsuarioSchema), async (req, res, next) => {
    try {
        const id = await usuario.create(req.body);

        return res.status(201).json({ message: 'Usuário criado com sucesso', id });
    } catch (error) {
        next(error);
    }
});

// Público: login
router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
        const usuarioLogado = await usuario.login(req.body.email, req.body.senha);
        const token = criarToken(usuarioLogado);

        return res.status(200).json({
            message: 'Login realizado com sucesso',
            token,
            usuario: usuarioLogado
        });
    } catch (error) {
        next(error);
    }
});

// A partir daqui toda rota exige token
router.use(exigirAutenticacao);

router.get('/', async (_req, res, next) => {
    try {
        const usuarios = await usuario.getAll();

        return res.status(200).json({ message: 'Usuários encontrados', usuarios });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', validate(idParamsSchema, 'params'), async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (Number(req.user.sub) !== id) {
            throw HttpError.forbidden('Sem permissão para consultar outro usuário');
        }

        const usuarioEncontrado = await usuario.getById(id);

        if (!usuarioEncontrado) {
            throw HttpError.notFound('Usuário não encontrado');
        }

        return res.status(200).json({ message: 'Usuário consultado', usuario: usuarioEncontrado });
    } catch (error) {
        next(error);
    }
});

router.put(
    '/:id',
    validate(idParamsSchema, 'params'),
    validate(atualizarUsuarioSchema),
    async (req, res, next) => {
        try {
            const id = Number(req.params.id);

            if (Number(req.user.sub) !== id) {
                throw HttpError.forbidden('Sem permissão para editar outro usuário');
            }

            const usuarioAtualizado = await usuario.update(id, req.body);

            return res.status(200).json({
                message: 'Usuário atualizado com sucesso',
                usuario: usuarioAtualizado
            });
        } catch (error) {
            next(error);
        }
    }
);

router.delete('/:id', validate(idParamsSchema, 'params'), async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (Number(req.user.sub) !== id) {
            throw HttpError.forbidden('Sem permissão para excluir outro usuário');
        }

        await usuario.remove(id);

        return res.status(200).json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        next(error);
    }
});

export default router;
