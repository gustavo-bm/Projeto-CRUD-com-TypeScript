import { Request, Response, Router } from "express";
import User from "../entities/User";
import UserRepository from "../repositories/UserRepository";
import IUser from "../interfaces/IUser";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Gestor de rotas
const userRouter = Router();

// Rota GET para buscar todos os usuários
userRouter.get('/', async ( _req: Request, res: Response ): Promise<Response> => {
    const users = await UserRepository.getUsers();
    return res.status(200).json(users);
})

// Rota POST para criar um usuário
userRouter.post('/', async ( req: Request, res: Response ): Promise<Response> => {
    const { name, email, password }: IUser = req.body;

    // Verifica se os dados necessários foram enviados
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Nome, email e senha são requeridos"})
    }

    try {
        // Hase da senha é realizado antes de salvá-la
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserRepository.createUser({ name, email, password: hashedPassword });
        return res.status(201). json(newUser); // Status 201 (criado)
    } catch (error) {
        return res.status(500).json({ message: "Erro ao criar user", error });
    }
})

// Rota post para login (Sign In)
userRouter.post('/login', async (req: Request, res: Response): Promise<Response> => {
    const { email, password } = req.body;

    // Verifica se email e senha foram fornecidos
    if (!email || !password) {
        return res.status(400).json({ message: "Email e senha são obrigatórios"});
    }

    try {
        const user = await UserRepository.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }

        // Verifica a senha
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Senha incorreta" });
        }

        // Gera o token JWT
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {expiresIn: "1h"});
        return res.status(200).json({ token }); // Retorna o token no corpo da resposta

    } catch (error) {
        return res.status(500).json({ message: "Erro no login", error });
    }
})

// Rota para atualizar um usuário
userRouter.put('/:id', async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params; // Obtém o id da url
    const userData: IUser = req.body; // Obtém os dados do corpo da requisição

    // Chama o método do repositório para atualizar o usuário
    const updatedUser = await UserRepository.updateUser(Number(id), userData);

    if (updatedUser) {
        return res.status(200).json(updatedUser);
    } else {
        return res.status(404).json({ message: "Usuário não encontrado." })
    }
})

// Remover um usuário
userRouter.delete('/:id', async (req: Request, res: Response): Promise<Response> => {
    const { id } = req.params;

    const deleted = await UserRepository.deleteUser(Number(id));

    if (deleted) {
        return res.status(204).send(); // Retorna "204 No Content" se a exclusão for bem-sucedida 
    } else {
        return res.status(404).json({ message: "Usuário não encontrado." })
    }
})

export default userRouter;


