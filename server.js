import express from "express";
import cors from "cors";
import tarefaRoutes from "./features/tarefa/tarefa.routes.js";
import usuarioRoutes from "./features/usuario/usuario.routes.js";

export const api = express();
const PORT = process.env.APIPORT ?? 3000;

api.use(cors());
api.use(express.json());

api.use("/tarefas", tarefaRoutes);
api.use("/usuarios", usuarioRoutes);

api.get("/health", (_req, res) => {
  return res.status(200).json({
    status: "UP",
  });
});

api.listen(PORT, () => {
  console.log(`API: http://localhost:${PORT}`);
});

