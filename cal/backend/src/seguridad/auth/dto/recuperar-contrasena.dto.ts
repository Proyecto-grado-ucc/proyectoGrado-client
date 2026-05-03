import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecuperarContrasenaDto {
  @ApiProperty({ example: 'docente@cambridge.edu.co' })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  email: string;
}
