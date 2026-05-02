import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerta } from '../entidades/alerta.entidad';
import { RespuestaAlertaDto } from './dto/respuesta-alerta.dto';

@Injectable()
export class AlertasServicio {
  constructor(
    @InjectRepository(Alerta) private readonly alertaRepo: Repository<Alerta>,
  ) {}

  async listar(periodoId?: number): Promise<RespuestaAlertaDto[]> {
    const where = periodoId ? { periodoId } : {};
    const alertas = await this.alertaRepo.find({ where, order: { creadoEn: 'DESC' } });
    return alertas.map(this.mapear);
  }

  async marcarLeida(id: number): Promise<RespuestaAlertaDto> {
    const alerta = await this.alertaRepo.findOne({ where: { id } });
    if (!alerta) throw new NotFoundException(`Alerta ${id} no encontrada`);
    alerta.leida = true;
    return this.mapear(await this.alertaRepo.save(alerta));
  }

  async eliminar(id: number): Promise<void> {
    const alerta = await this.alertaRepo.findOne({ where: { id } });
    if (!alerta) throw new NotFoundException(`Alerta ${id} no encontrada`);
    await this.alertaRepo.remove(alerta);
  }

  private mapear(a: Alerta): RespuestaAlertaDto {
    return {
      id: a.id,
      docenteId: a.docenteId,
      periodoId: a.periodoId,
      tipo: a.tipo,
      nivel: a.nivel,
      mensaje: a.mensaje,
      leida: a.leida,
      creadoEn: a.creadoEn,
    };
  }
}
