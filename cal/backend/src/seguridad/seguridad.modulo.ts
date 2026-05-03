import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entidades/audit-log.entidad';
import { Permiso } from './entidades/permiso.entidad';
import { Rol, RolNombre } from './entidades/rol.entidad';
import { Sesion } from './entidades/sesion.entidad';
import { Usuario } from './entidades/usuario.entidad';
import { AuthServicio } from './auth/auth.servicio';
import { AuthControlador } from './auth/auth.controlador';
import { CorreoServicio } from './auth/correo.servicio';
import { JwtEstrategia } from './auth/estrategias/jwt.estrategia';
import { JwtGuardia } from './auth/guardias/jwt.guardia';
import { RolesGuardia } from './auth/guardias/roles.guardia';
import { AuditLogServicio } from './audit-log/audit-log.servicio';
import { AuditLogControlador } from './audit-log/audit-log.controlador';
import { UsuariosServicio } from './usuarios/usuarios.servicio';
import { UsuariosControlador } from './usuarios/usuarios.controlador';
import { AuditarInterceptor } from './decoradores/auditar.interceptor';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRETO', 'secreto_por_defecto_cambiar'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRACION', '8h') },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Rol, Permiso, Usuario, Sesion, AuditLog]),
  ],
  providers: [
    AuthServicio,
    CorreoServicio,
    UsuariosServicio,
    AuditLogServicio,
    JwtEstrategia,
    JwtGuardia,
    RolesGuardia,
    { provide: APP_INTERCEPTOR, useClass: AuditarInterceptor },
  ],
  controllers: [AuthControlador, UsuariosControlador, AuditLogControlador],
  exports: [AuthServicio, CorreoServicio, UsuariosServicio, AuditLogServicio, JwtGuardia, RolesGuardia],
})
export class SeguridadModulo implements OnModuleInit {
  private readonly logger = new Logger(SeguridadModulo.name);

  constructor(
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
  ) {}

  async onModuleInit() {
    await this.sembrarRoles();
  }

  private async sembrarRoles(): Promise<void> {
    const rolesIniciales = [
      { nombre: RolNombre.Admin, descripcion: 'Acceso total al sistema' },
      { nombre: RolNombre.Docente, descripcion: 'Consulta de horario e indicadores propios' },
      { nombre: RolNombre.Estudiante, descripcion: 'Formularios de evaluación y horario de grupo' },
    ];

    for (const datos of rolesIniciales) {
      const existe = await this.rolRepo.findOne({ where: { nombre: datos.nombre } });
      if (!existe) {
        await this.rolRepo.save(this.rolRepo.create(datos));
        this.logger.log(`Rol '${datos.nombre}' creado`);
      }
    }
  }
}
