import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { Sesion } from '../entidades/sesion.entidad';
import { Usuario } from '../entidades/usuario.entidad';
import { LoginDto } from './dto/login.dto';
import { RecuperarContrasenaDto } from './dto/recuperar-contrasena.dto';
import { RestablecerContrasenaDto } from './dto/restablecer-contrasena.dto';
import { RespuestaAuthDto } from './dto/respuesta-auth.dto';
import { CorreoServicio } from './correo.servicio';

@Injectable()
export class AuthServicio {
  private readonly logger = new Logger(AuthServicio.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Sesion)
    private readonly sesionRepo: Repository<Sesion>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly correoServicio: CorreoServicio,
  ) {}

  async login(dto: LoginDto, ipOrigen: string): Promise<RespuestaAuthDto> {
    const usuario = await this.usuarioRepo.findOne({
      where: { email: dto.email, activo: true },
      select: ['id', 'email', 'passwordHash', 'nombre', 'activo'],
      relations: ['rol'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const contrasenaValida = await bcrypt.compare(dto.contrasena, usuario.passwordHash);
    if (!contrasenaValida) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    const accessToken = this.firmarAcceso(usuario.id, usuario.email, usuario.rol.nombre);
    const refreshToken = this.firmarRefresco(usuario.id);

    const expiracionAcceso = this.calcularExpiracion(
      this.configService.get<string>('JWT_EXPIRACION', '8h'),
    );

    await this.sesionRepo.save(
      this.sesionRepo.create({
        usuario,
        tokenJwt: accessToken,
        fechaEmision: new Date(),
        fechaExpiracion: expiracionAcceso,
        ipOrigen: ipOrigen || null,
      }),
    );

    return { access_token: accessToken, refresh_token: refreshToken, rol: usuario.rol.nombre };
  }

  async refrescar(refreshToken: string): Promise<Pick<RespuestaAuthDto, 'access_token'>> {
    let payload: { sub: number; tipo: string };
    try {
      payload = this.jwtService.verify<{ sub: number; tipo: string }>(refreshToken);
    } catch {
      throw new UnauthorizedException('Token de refresco invalido o expirado');
    }

    if (payload.tipo !== 'refresco') {
      throw new UnauthorizedException('Token invalido para esta operacion');
    }

    const usuario = await this.usuarioRepo.findOne({
      where: { id: payload.sub, activo: true },
      relations: ['rol'],
    });

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    const accessToken = this.firmarAcceso(usuario.id, usuario.email, usuario.rol.nombre);
    return { access_token: accessToken };
  }

  async logout(usuarioId: number): Promise<void> {
    await this.sesionRepo.update(
      { usuario: { id: usuarioId } },
      { fechaExpiracion: new Date() },
    );
  }

  /**
   * Paso 1: Solicitar recuperacion de contrasena.
   * Verifica que el email exista, genera token seguro y envia correo.
   * Siempre responde con el mismo mensaje para no revelar si el email existe.
   */
  async recuperarContrasena(dto: RecuperarContrasenaDto): Promise<{ mensaje: string }> {
    const usuario = await this.usuarioRepo.findOne({
      where: { email: dto.email, activo: true },
      select: ['id', 'email', 'nombre', 'resetToken', 'resetTokenExpiry'],
    });

    if (!usuario) {
      // Seguridad: no revelar si el email existe o no
      this.logger.warn(`Recuperacion solicitada para email no registrado: ${dto.email}`);
      return { mensaje: 'Si el correo esta registrado, recibiras las instrucciones en breve.' };
    }

    // Generar token aleatorio seguro de 64 bytes
    const token = crypto.randomBytes(64).toString('hex');
    const expiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

    // Guardar hash del token (no el token plano) para mayor seguridad
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    await this.usuarioRepo.update(usuario.id, {
      resetToken: tokenHash,
      resetTokenExpiry: expiry,
    });

    try {
      await this.correoServicio.enviarRecuperacionContrasena(usuario.email, usuario.nombre, token);
    } catch (error) {
      // Si falla el correo, limpiar el token para que no quede huerfano
      await this.usuarioRepo.update(usuario.id, { resetToken: null, resetTokenExpiry: null });
      this.logger.error('Fallo al enviar correo de recuperacion', error);
      throw new BadRequestException(
        'No se pudo enviar el correo. Verifica la configuracion SMTP o intenta mas tarde.',
      );
    }

    return { mensaje: 'Si el correo esta registrado, recibiras las instrucciones en breve.' };
  }

  /**
   * Paso 2: Restablecer contrasena con el token recibido por correo.
   */
  async restablecerContrasena(dto: RestablecerContrasenaDto): Promise<{ mensaje: string }> {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');

    const usuario = await this.usuarioRepo.findOne({
      where: { resetToken: tokenHash },
      select: ['id', 'email', 'nombre', 'resetToken', 'resetTokenExpiry'],
    });

    if (!usuario) {
      throw new BadRequestException('El enlace de recuperacion no es valido o ya fue utilizado.');
    }

    if (!usuario.resetTokenExpiry || usuario.resetTokenExpiry < new Date()) {
      // Limpiar token expirado
      await this.usuarioRepo.update(usuario.id, { resetToken: null, resetTokenExpiry: null });
      throw new BadRequestException('El enlace de recuperacion ha expirado. Solicita uno nuevo.');
    }

    const saltRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    const nuevoHash = await bcrypt.hash(dto.nuevaContrasena, saltRounds);

    await this.usuarioRepo.update(usuario.id, {
      passwordHash: nuevoHash,
      resetToken: null,
      resetTokenExpiry: null,
    });

    // Invalidar todas las sesiones activas por seguridad
    await this.sesionRepo.update(
      { usuario: { id: usuario.id } },
      { fechaExpiracion: new Date() },
    );

    this.logger.log(`Contrasena restablecida para usuario ID ${usuario.id}`);
    return { mensaje: 'Contrasena restablecida correctamente. Ya puedes iniciar sesion.' };
  }

  async hashContrasena(contrasena: string): Promise<string> {
    const saltRounds = this.configService.get<number>('BCRYPT_ROUNDS', 12);
    return bcrypt.hash(contrasena, saltRounds);
  }

  private firmarAcceso(sub: number, email: string, rol: string): string {
    return this.jwtService.sign(
      { sub, email, rol, tipo: 'acceso' },
      { expiresIn: this.configService.get<string>('JWT_EXPIRACION', '8h') },
    );
  }

  private firmarRefresco(sub: number): string {
    return this.jwtService.sign(
      { sub, tipo: 'refresco' },
      { expiresIn: this.configService.get<string>('JWT_EXPIRACION_REFRESH', '7d') },
    );
  }

  private calcularExpiracion(duracion: string): Date {
    const ahora = Date.now();
    const unidades: Record<string, number> = { h: 3600_000, d: 86_400_000, m: 60_000 };
    const match = duracion.match(/^(\d+)([hmd])$/);
    if (!match) return new Date(ahora + 8 * 3600_000);
    return new Date(ahora + parseInt(match[1]) * (unidades[match[2]] ?? 3600_000));
  }
}
