import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Usuario } from "./usuario.entity";
import { Repository } from "typeorm";
import { CreateUsuarioDto } from "./CreateUsuarioDto";
import { ResponseUsuarioDto } from "./ResponseUsuarioDto";
import { EmailExistenteError } from "src/erros/EmailExistenteError";
import { EmailInexistenteError } from "src/erros/EmailInexistenteError";
import { TokenService } from "src/token/token.service";
import { MailService } from "src/nodemailer/mail";


enum STATUS {
    ATIVADO = 1,
    DESATIVADO = 0
}

@Injectable()
export class UsuarioService {
    constructor(
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
        private readonly tokenService: TokenService,
        private readonly mailService: MailService
    ) { }


    async listar(): Promise<Usuario[]> {
        return await this.usuarioRepository.find()
    }

    async criar(usuarioDto: CreateUsuarioDto): Promise<ResponseUsuarioDto> {
        const { email } = usuarioDto
        const existeEmail = await this.usuarioRepository.findOne({
            where: { email }
        })
        if (existeEmail) {
            throw new EmailExistenteError(existeEmail.email)
        }
        const usuario = this.usuarioRepository.create(usuarioDto);
        usuario.status = STATUS.DESATIVADO
        const novoUsuario = await this.usuarioRepository.save(usuario);
        const responseUsuarioDto: ResponseUsuarioDto = {
            id: novoUsuario.id,
            nome: novoUsuario.nome,
            sobrenome: novoUsuario.sobrenome,
            email: novoUsuario.email,
            cpf: novoUsuario.cpf,
            status: novoUsuario.status
        }
        return responseUsuarioDto
    }

    async validarEmail(email: string): Promise<any> {
        const usuarioExiste: ResponseUsuarioDto = await this.usuarioRepository.findOne({
            where: {
                email
            }
        })
        if (usuarioExiste) {
            const token = await this.tokenService.gerarToken(usuarioExiste.id);
            usuarioExiste.status = STATUS.ATIVADO
            await this.usuarioRepository.save(usuarioExiste);
            await this.mailService.enviarMail(usuarioExiste, token)
            return token
        }
    }
}