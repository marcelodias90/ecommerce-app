import { Inject, Injectable } from "@nestjs/common";

import { AdicionarUsuarioRepository } from "src/usuario/data/protocols/db/adicionar-usuario";
import { AdicionarUsuario } from "src/usuario/domain/usecases/adicionar-usuario";
import { Repository } from "typeorm";
import { Usuario } from "../entities/usuario.entity";
import { USUARIO_REPOSITORY } from "../typeOrm/typeorm.repositories";

@Injectable()
export class UsuarioRepository implements AdicionarUsuarioRepository {
    constructor(@Inject(USUARIO_REPOSITORY) private usuarioRepository: Repository<Usuario>) { }
    async adicionar(data: AdicionarUsuario.Parametros): Promise<AdicionarUsuario.Resultado> {
        const usuario = await this.usuarioRepository.save(data)
        return {
            id: usuario.id,
            nome: usuario.nome,
            sobrenome: usuario.sobrenome,
            email: usuario.email
        }
    }
} 